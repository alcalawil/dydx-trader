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

const DEFAULT_AMOUNT = parseFloat(process.env.DEFAULT_AMOUNT) || 0.1;
const EXPOSURE = process.env.EXPOSURE || 'low'; // low or high

const DIFFERENCE_IN_PERCENTAGE =
  parseFloat(process.env.DIFFERENCE_IN_PERCENTAGE) || 0.01;
const ORDER_SIDE = process.env.ORDER_SIDE || 'sell';

const DIFFERENCE_BETWEEN_BID = process.env.DIFFERENCE_BETWEEN_BID;
const DIFFERENCE_BETWEEN_ASK = process.env.DIFFERENCE_BETWEEN_ASK;
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

const postOrder = async ({ side = 'sell', price }) => {
  const response =
    side === 'buy'
      ? await doPostRequest({
        uri: BUY_ORDER_URI,
        body: {
          price,
          amount: DEFAULT_AMOUNT
        }
      })
      : await doPostRequest({
        uri: SELL_ORDER_URI,
        body: {
          price,
          amount: DEFAULT_AMOUNT
        }
      });

  if (!response) return null;

  return response.order;
};

const calculatePercentage = (inputVale, percentageNumber) => {
  return inputVale * (percentageNumber / 100);
};

const compareBid = (dydxBid, hitbtcBid) => {
  if (hitbtcBid > dydxBid) return dydxBid + (hitbtcBid - dydxBid) * DIFFERENCE_BETWEEN_BID;
  if (hitbtcBid === dydxBid) return dydxBid;
  if (hitbtcBid < dydxBid) return hitbtcBid;
};

const compareAsk = (dydxAsk, hitbtcAsk) => {
  if (hitbtcAsk > dydxAsk) return hitbtcAsk;
  if (hitbtcAsk === dydxAsk) return dydxAsk;
  if (hitbtcAsk < dydxAsk) return hitbtcAsk + (dydxAsk - hitbtcAsk) * DIFFERENCE_BETWEEN_ASK;
};

const calculatePrice = async (side = 'sell') => {
  const hitbtc = await doGetRequest({ uri: HITBTC_ETHDAI_TICKER });

  if (side === 'buy') {
    const { bid: dydxBid } = await doGetRequest({ uri: GET_BID_URI });
    const bid = compareBid(dydxBid, Number(hitbtc.bid));
    const percentage = Math.abs(
      calculatePercentage(bid, DIFFERENCE_IN_PERCENTAGE)
    );
    console.log(`---- dYdX bid: ${dydxBid} ----`);
    console.log(`---- HitBTC bid: ${hitbtc.bid} ----`);
    console.log(`**** Calculated BID: ${bid} ****`);

    const price = EXPOSURE === 'high' ? bid + percentage : bid - percentage;

    return price;
  }

  const { ask: dydxAsk } = await doGetRequest({ uri: GET_ASK_URI });
  const ask = compareAsk(dydxAsk, Number(hitbtc.ask));
  const percentage = Math.abs(
    calculatePercentage(ask, DIFFERENCE_IN_PERCENTAGE)
  );
  console.log(`---- dYdX ask: ${dydxAsk} ----`);
  console.log(`---- HitBTC ask: ${hitbtc.ask} ----`);
  console.log(`**** Calculated ASK: ${ask} ****`);

  const price = EXPOSURE === 'high' ? ask - percentage : ask + percentage;

  return price;
};

const isFillOrPartiallyFill = async orderId => {
  const { fills } = await doGetRequest({ uri: MY_FILLS_URI });
  const orderFilled = fills.find(fill => fill.orderId === orderId);

  if (orderFilled) {
    return true;
  }

  return false;
};

const tradingCycle = async () => {
  console.log('My orders', myOrders.map((order, OrderId) => order.id));

  if (myOrders.length > 0) {
    // get status
    // if open --> cancel
    // re post
    await Promise.all(
      myOrders.map(async order => {
        const filled = await isFillOrPartiallyFill(order.id);
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

  const price = await calculatePrice(ORDER_SIDE);
  const order = await postOrder({ side: ORDER_SIDE, price });

  if (!order) {
    console.log('Error posting order...');
    return;
  }
  myOrders.push(order);
  console.log(`>>> Posted ${ORDER_SIDE} order at ${price} dai. Id: `, order.id);
  console.log('\n===============================================================\n');
};

console.log(`[${new Date().toISOString()}] - Starting program...`);
console.log(` 
  *** Orders side: ${ORDER_SIDE}
  *** Exposure (risk): ${EXPOSURE}
  *** Bid/Ask distance: ${DIFFERENCE_IN_PERCENTAGE}% 
  *** Orders Amount: ${DEFAULT_AMOUNT}
  --------------------------------------------------
`);

startCycle();
