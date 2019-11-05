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
const DEFAULT_PAIR = process.env.DEFAULT_PAIR || 'WETH-DAI';
const ORDER_SIDE = process.env.ORDER_SIDE || 'sell';

let _myOrders = [];

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

const postOrder = async (price) => {
  const { order } =
    ORDER_SIDE === 'sell'
      ? await doPostRequest({
          uri: BUY_ORDER_URI,
          body: {
            price,
            amount: DEFAULT_AMOUNT,
            pair: DEFAULT_PAIR
          }
        })
      : await doPostRequest({
          uri: SELL_ORDER_URI,
          body: {
            price,
            amount: DEFAULT_AMOUNT,
            pair: DEFAULT_PAIR
          }
        });

  // TODO: Poner un try catch para validar que la orden haya sido succes antes de guardarla
  _myOrders.push(order);
  return order;
};

const calculatePercentage = (inputVale, percentageNumber) => {
  return inputVale * (percentageNumber / 100);
};

const getMidPrice = async () => {
  const { ask } = await doGetRequest({ uri: GET_ASK_URI });
  const { bid } = await doGetRequest({ uri: GET_BID_URI });

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

const calculatePrice = async (side = 'sell') => {
  const hitbtc = await doGetRequest({ uri: HITBTC_ETHDAI_TICKER });
  const midPrice = await getMidPrice();
  console.log('---------------------------------- Mid Price = ', midPrice);

  if (side === 'buy') {
    const { bid: dydxBid } = await doGetRequest({ uri: GET_BID_URI });
    const price = compareBid(dydxBid, Number(hitbtc.bid), midPrice);

    console.log(`---- dYdX bid: ${dydxBid} ----`);
    console.log(`---- HitBTC bid: ${hitbtc.bid} ----`);
    console.log(`**** Calculated Price: ${price} ****`);

    return price;
  }

  const { ask: dydxAsk } = await doGetRequest({ uri: GET_ASK_URI });
  const price = compareAsk(dydxAsk, Number(hitbtc.ask), midPrice);

  console.log(`---- dYdX ask: ${dydxAsk} ----`);
  console.log(`---- HitBTC ask: ${hitbtc.ask} ----`);
  console.log(`**** Calculated Price: ${price} ****`);

  return price;
};

const cancelOrder = async (orderId) => {
  // TODO: obtener el codigo del response y verificarlo

  const response = doPostRequest({
    uri: CANCEL_URI,
    body: {
      orderId: orderId
    }
  });

  // TODO: remover solo si el cancel fue succes
  removeOrderFromRegistry(oldOrder.id);
};

const removeOrderFromRegistry = (orderId) => {
  _myOrders = _myOrders.filter(myOrder => myOrder.id !== orderId);
};

// TODO: Handlear errores
const rePost = async (oldOrder, newPrice) => {
  // cancel
  await cancelOrder(oldOrder.id);
  console.log(`Canceled order`, oldOrder.id);

  // post new order
  const order = await postOrder({ side: ORDER_SIDE, newPrice });  
  return order;
};

// =============================================================================================
// =============================================================================================
let openOrders = [];

const tradingCycle = async () => {

  const spreadOrders = new SpreadOrders(_range);
  // TODO: Use best-prices endpoint
  const { ask: dydxAsk } = await doGetRequest({ uri: GET_ASK_URI });
  const { bid: dydxBid } = await doGetRequest({ uri: GET_BID_URI });
  const hitbtcPrice = await doGetRequest({ uri: HITBTC_ETHDAI_TICKER });

  const internalPrice = new PriceDetail(dydxAsk, dydxBid);
  const externalPrice = new PriceDetail(hitbtcPrice.ask, hitbtcPrice.bid);

  
  // Cancel all
  await cancelOrders(_openOrders);
  
  // Generate orders from rules
  const cexOrders = spreadOrders.output({ internalPrice, externalPrice });
  
  // Post(orders)
  const responseOrders = await postMany(cexOrders);

}

const postMany =  (cexOrders) => Promise.all(
  cexOrders.map(order => postOrder(order))
);

const cancelOrders = (orders) => Promise.all(
  orders.map((order) => cancelOrder(order.id))
);



startCycle();

const _range = [
  {
    spread: 0.25,
    amount: 1
  },
  {
    spread: 0.5,
    amount: 1
  },
  {
    spread: 0.75,
    amount: 1
  }
];

class SpreadOrders {
  constructor(range) {
    this.range = range;
  }

  outputOrders(marketData) {
    const { internalPrice, externalPrice } = marketData;
  

    return this.range.map(({ spread, amount }) => {
      const { ask, bid } = this.calculatePrices(internalPrice, externalPrice, spread);

      return {
        ask: {
          price: ask,
          amount,
          side: 'sell'
        },
        bid: {
          price: bid,
          amount,
          side: 'buy'
        }
      }
    });
  }

  calculatePrices(internalPrice, externalPrice, spread) {
    if (externalPrice.mid > internalPrice.mid) {
      let bidSpreadPrice = externalPrice.mid * (1 - spread / 2);

      if (bidSpreadPrice > internalPrice.mid) {
        return {
          ask: internalPrice.mid * (1 + spread / 2),
          bid: internalPrice.mid * (1 - spread / 2)
        }
      }

      return {
        ask: externalPrice.mid * (1 + spread / 2),
        bid: bidSpreadPrice
      }
    } else {
      let askSpreadPrice = externalPrice.mid * (1 + spread / 2);

      if (askSpreadPrice < internalPrice.mid) {
        return {
          ask: internalPrice.mid * (1 + spread / 2),
          bid: internalPrice.mid * (1 - spread / 2)
        }
      }

      return {
        ask: askSpreadPrice,
        bid: externalPrice.mid * (1 - spread / 2)
      }
    }
  }

  rulesAsk(internalPrice, externalPrice, spread) {

  }

  rulesBid(internalPrice, externalPrice, spread) {
    if (externalPrice.mid > internalPrice.mid) {
      let spreadPrice = calcSpreadPrice(externalPrice.mid, spread);

      if (spreadPrice > internalPrice.mid) {
        spreadPrice = calcSpreadPrice(internalPrice.mid, spread);
      }

      return spreadPrice;
    }


  }

  calcSpreadPrice(midPrice, spread) {
    return midPrice * (1 - spread / 2);
  }

  // createPriceRange(priceFrom, side, adjust = 0.5) {
  //   const prices = [];
  //   for (let i = 1; i <= 4; i += 1) {
  //     const adjustedPercentage = i * adjust;
  //     const adjustedPrice =
  //       side === MarketSide.sell
  //         ? priceFrom + calculatePercentage(priceFrom, adjustedPercentage)
  //         : priceFrom - calculatePercentage(priceFrom, adjustedPercentage);
  //     prices.push(adjustedPrice);
  //   }

  //   return prices;
  // }
}

class PriceDetail {
  constructor(ask, bid) {
    this.ask = ask;
    this.bid = bid;
    this.mid = (ask + bid) / 2;
  }
}