const rp = require('request-promise');

// check for env-file
if (process.env.LOADED !== 'TRUE') {
  console.log('####### No .env file provided ########');
  process.kill();
}
// Constants
const SECONDS_INTERVAL = parseFloat(process.env.HEAD_SECONDS_INTERVAL) || 60; // Cycle interval in seconds
const BASE_URI = process.env.BASE_URI || 'http://localhost:3000';
const BUY_ORDER_URI = BASE_URI + '/api/orders/buy';
const SELL_ORDER_URI = BASE_URI + '/api/orders/sell';
const GET_BID_URI = BASE_URI + '/api/orders/bid';
const GET_ASK_URI = BASE_URI + '/api/orders/ask';
const MY_FILLS_URI = BASE_URI + '/api/orders/myfills';
const CANCEL_URI = BASE_URI + '/api/orders/cancel';
const HITBTC_BASE_URI = process.env.HITBTC_BASE_URI;
const HITBTC_ETHDAI_TICKER = HITBTC_BASE_URI + '/ticker/ethdai';
const HITBTC_ETHUSDC_TICKER = HITBTC_BASE_URI + '/ticker/ethusdc';

const DEFAULT_AMOUNT_BUY = parseFloat(process.env.DEFAULT_AMOUNT_BUY) || 0.1;
const DEFAULT_AMOUNT_SELL = parseFloat(process.env.DEFAULT_AMOUNT_SELL) || 0.1;

const DIFFERENCE_IN_PERCENTAGE =
  parseFloat(process.env.DIFFERENCE_IN_PERCENTAGE) || 0.01;
const ORDER_SIDE = process.env.ORDER_SIDE || 'sell';

const DIFFERENCE_BETWEEN_BID = process.env.DIFFERENCE_BETWEEN_BID;
const DIFFERENCE_BETWEEN_ASK = process.env.DIFFERENCE_BETWEEN_ASK;
const DEFAULT_PAIR = process.env.DEFAULT_PAIR;

let cycle;
let myOrders = [];

const stopCycle = () => clearInterval(cycle);

const startCycle = () => {
  tradingCycle();
  cycle = setInterval(tradingCycle, SECONDS_INTERVAL * 1000);
};

const doPostRequest = async ({ uri, body = {} }) => {
  let response = null;
  try {
    response = await rp.post({
      uri,
      body,
      json: true,
      headers: {
        'User-Agent': 'Request-Promise',
        'api-key': process.env.OPERATOR_API_KEY
      }
    });
  } catch (error) {
    console.log(`[${new Date().toISOString()}]`, error.message);
  }

  return response;
};

const doGetRequest = async ({ uri }) => {
  let response = null;
  try {
    response = await rp.get({
      uri,
      json: true,
      headers: {
        'User-Agent': 'Request-Promise',
        'api-key': process.env.OPERATOR_API_KEY
      }
    });
  } catch (error) {
    console.log(`[${new Date().toISOString()}]`, error.message);
  }

  return response;
};

const postOrder = async ({ side = 'sell', price, pair }) => {
  const response =
    side === 'buy'
      ? await doPostRequest({
          uri: BUY_ORDER_URI,
          body: {
            price,
            amount: DEFAULT_AMOUNT_BUY,
            pair
          }
        })
      : await doPostRequest({
          uri: SELL_ORDER_URI,
          body: {
            price,
            amount: DEFAULT_AMOUNT_SELL,
            pair
          }
        });

  if (!response) return null;

  return response.order;
};

const calculatePercentage = (inputVale, percentageNumber) => {
  return inputVale * (percentageNumber / 100);
};

const getMidPrice = async () => {
  const { ask } = await doGetRequest({ uri: `${GET_ASK_URI}?pair=${DEFAULT_PAIR}` });
  const { bid } = await doGetRequest({ uri: `${GET_BID_URI}?pair=${DEFAULT_PAIR}` });

  if (!ask || !bid) {
    return null;
  }
  const midPrice = (ask + bid) / 2;

  return midPrice;
};

const compareBid = (dydxBid, hitbtcBid, midPrice) => {
  if (hitbtcBid > dydxBid) {
    if (midPrice < hitbtcBid) { // midPrice away of the bid
      return dydxBid + getPriceDiff(midPrice, dydxBid) * DIFFERENCE_BETWEEN_BID;
    }
    return dydxBid + getPriceDiff(hitbtcBid, dydxBid) * DIFFERENCE_BETWEEN_BID;
  }

  return hitbtcBid;
};

const compareAsk = (dydxAsk, hitbtcAsk, midPrice) => {
  if (hitbtcAsk < dydxAsk) { // hitbtc is ask
    if (midPrice > hitbtcAsk) { // midPrice away of the ask
      return dydxAsk - getPriceDiff(midPrice, dydxAsk) * DIFFERENCE_BETWEEN_ASK;
    }
    return dydxAsk - getPriceDiff(hitbtcAsk, dydxAsk) * DIFFERENCE_BETWEEN_ASK;
  }

  return hitbtcAsk;
};

const getPriceDiff = (price1, price2) => {
  return Math.abs(price1 - price2);
};

const calculatePrice = async (side = 'sell', externalPrice) => {
  const midPrice = await getMidPrice();
  console.log('---------------------------------- Mid Price = ', midPrice);

  if (side === 'buy') {
    const { bid: dydxBid } = await doGetRequest({ uri: `${GET_BID_URI}?pair=${DEFAULT_PAIR}` });
    const price = compareBid(dydxBid, Number(externalPrice.bid), midPrice);

    console.log(`---- dYdX bid: ${dydxBid} ----`);
    console.log(`---- External bid: ${externalPrice.bid} ----`);

    return price;
  }

  const { ask: dydxAsk } = await doGetRequest({ uri: `${GET_ASK_URI}?pair=${DEFAULT_PAIR}` });
  const price = compareAsk(dydxAsk, Number(externalPrice.ask), midPrice);

  console.log(`---- dYdX ask: ${dydxAsk} ----`);
  console.log(`---- External ask: ${externalPrice.ask} ----`);

  return price;
};

const wasFilled = async orderId => {
  const { fills } = await doGetRequest({ uri: `${MY_FILLS_URI}?pair=${DEFAULT_PAIR}` });
  const orderFilled = fills.find(fill => 
     fill.orderId === orderId && fill.orderStatus === 'FILLED'
  );

  if (orderFilled) {
    console.log(`An order was filled, orderId: ${orderId}`);
    return true;
  }

  return false;
};

// =============================================================================================
// =============================================================================================

const tradingCycle = async () => {
  console.log('My orders', myOrders.map((order) => order.id));

  if (myOrders.length > 0) {
    // get status
    // if open --> cancel
    // re post
    await Promise.all(
      myOrders.map(async order => {
        const filled = await wasFilled(order.id);
        if (filled) {
          // stop return
          console.log('Filleada baby');
          myOrders = myOrders.filter(myOrder => myOrder.id !== order.id);
          return;
        }

        // Case: ORDER = OPEN
        // cancel
        const canceled = await doPostRequest({
          uri: CANCEL_URI,
          body: {
            orderId: order.id
          }
        });

        myOrders = myOrders.filter(myOrder => myOrder.id !== order.id);
        console.log(`Canceled order`, order.id);
      })
    );
  }

  // No orders case
  let externalPriceUri = HITBTC_ETHDAI_TICKER;
  if (DEFAULT_PAIR === 'WETH-USDC') {
    externalPriceUri = HITBTC_ETHUSDC_TICKER;
  }

  const externalPrice = await doGetRequest({ uri: externalPriceUri });
  const price = await calculatePrice(ORDER_SIDE, externalPrice);
  
  console.log(`**** Calculated Price: ${price} ****`);

  const order = await postOrder({ side: ORDER_SIDE, price, pair: DEFAULT_PAIR });

  if (!order) {
    console.log('Error posting order...');
    return;
  }
  myOrders.push(order);
  console.log(`>>> Posted ${ORDER_SIDE} order at ${price} dai. Id: `, order.id);
  console.log('\n===============================================================\n');
};


// main

console.log(`[${new Date().toISOString()}] - Starting program...`);
console.log(`
  *** Orders side: ${ORDER_SIDE}
  *** Pair: ${DEFAULT_PAIR}
  *** Bid/Ask distance: ${DIFFERENCE_IN_PERCENTAGE}%
  *** Orders Amount: ${ORDER_SIDE === 'buy' ? DEFAULT_AMOUNT_BUY : DEFAULT_AMOUNT_SELL}
  --------------------------------------------------
`);

startCycle();
