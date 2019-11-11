const rp = require('request-promise');

// check for env-file
if (process.env.LOADED !== 'TRUE') {
  console.log('####### No .env file provided ########');
  process.kill();
}
// Constants
const SECONDS_INTERVAL = parseFloat(process.env.EXPOSED_HEAD_SECONDS_INTERVAL) || 60; // Cycle interval in seconds
const BASE_URI = process.env.BASE_URI || 'http://localhost:3000';
const BUY_ORDER_URI = BASE_URI + '/api/orders/buy';
const SELL_ORDER_URI = BASE_URI + '/api/orders/sell';
const GET_BID_URI = BASE_URI + '/api/orders/bid';
const GET_ASK_URI = BASE_URI + '/api/orders/ask';
const MY_FILLS_URI = BASE_URI + '/api/orders/myfills';
const CANCEL_URI = BASE_URI + '/api/orders/cancel';

const DEFAULT_AMOUNT_BUY = parseFloat(process.env.EXPOSED_DEFAULT_AMOUNT_BUY) || 0.1;
const DEFAULT_AMOUNT_SELL = parseFloat(process.env.EXPOSED_DEFAULT_AMOUNT_SELL) || 0.1;

const EXPOSURE = process.env.EXPOSED_EXPOSURE || 'low'; // low or high

const DIFFERENCE_IN_PERCENTAGE =
  parseFloat(process.env.EXPOSED_DIFFERENCE_IN_PERCENTAGE) || 0.01;
const ORDER_SIDE = process.env.ORDER_SIDE || 'sell';
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

const postOrder = async ({ side = 'sell', price }) => {
  const response =
    side === 'buy'
      ? await doPostRequest({
        uri: BUY_ORDER_URI,
        body: {
          price,
          amount: DEFAULT_AMOUNT_BUY,
          pair: DEFAULT_PAIR
        }
      })
      : await doPostRequest({
        uri: SELL_ORDER_URI,
        body: {
          price,
          amount: DEFAULT_AMOUNT_SELL,
          pair: DEFAULT_PAIR
        }
      });

  if (!response) return null;

  return response.order;
};

const calculatePercentage = (inputVale, percentageNumber) => {
  return inputVale * (percentageNumber / 100);
};

const calculatePrice = async (side = 'sell') => {
  if (side === 'buy') {
    const { bid } = await doGetRequest({ uri: `${GET_BID_URI}?pair=${DEFAULT_PAIR}` });
    const percentage = Math.abs(
      calculatePercentage(bid, DIFFERENCE_IN_PERCENTAGE)
    );
    console.log(`---- dYdX bid: ${bid} ----`);

    const price = EXPOSURE === 'high' ? bid + percentage : bid - percentage;

    return price;
  }

  const { ask } = await doGetRequest({ uri: `${GET_ASK_URI}?pair=${DEFAULT_PAIR}` });
  const percentage = Math.abs(
    calculatePercentage(ask, DIFFERENCE_IN_PERCENTAGE)
  );
  console.log(`---- dYdX ask: ${ask} ----`);

  const price = EXPOSURE === 'high' ? ask - percentage : ask + percentage;

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

const tradingCycle = async () => {
  console.log('My orders', myOrders.map((order) => order.id));

  if (myOrders.length > 0) {
    await Promise.all(
      myOrders.map(async order => {
        const filled = await wasFilled(order.id);
        if (filled) {
          console.log(`An order was filled, orderId:`, order.id);
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
  *** Orders Amount: ${ORDER_SIDE === 'buy' ? DEFAULT_AMOUNT_BUY : DEFAULT_AMOUNT_SELL}
  --------------------------------------------------
`);

startCycle();
