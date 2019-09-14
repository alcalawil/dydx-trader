const rp = require('request-promise');

// Constants
const SECONDS_INTERVAL = 20; // Cycle interval in seconds
const risks = [0, 1, 2];
const BASE_URI = 'http://localhost:3000';
const BUY_ORDER_URI = BASE_URI + '/api/orders/buy';
const SELL_ORDER_URI = BASE_URI + '/api/orders/sell';
const GET_BID_URI = BASE_URI + '/api/orders/bid';
const GET_ASK_URI = BASE_URI + '/api/orders/ask';
const MY_FILLS_URI = BASE_URI + '/api/orders/myfills';
const CANCEL_URI = BASE_URI + '/api/orders/cancel';

const DEFAULT_AMOUNT = 0.1;
const EXPOSURE = 'low';
const DIFFERENCE_IN_PERCENTAGE = 0.1;

let cycle;
let myOrders = [];

const stopCycle = () => clearInterval(cycle);

const startCycle = () => {
  cycle = setInterval(tradingCycle, SECONDS_INTERVAL * 1000);
};

const doPostRequest = async ({ uri, body = {} }) => {
  let response = null;
  try {
    response = await rp.post({
      uri,
      body,
      json: true
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
      json: true
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
            amount: 0.1
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
    const { bid } = await doGetRequest({ uri: GET_BID_URI });
    const percentage = Math.abs(
      calculatePercentage(bid, DIFFERENCE_IN_PERCENTAGE)
    );
    const price = EXPOSURE === 'high' ? bid + percentage : bid - percentage;

    return price;
  }

  const { ask } = await doGetRequest({ uri: GET_ASK_URI });
  const percentage = Math.abs(
    calculatePercentage(ask, DIFFERENCE_IN_PERCENTAGE)
  );
  const price = EXPOSURE === 'high' ? ask - percentage : ask + percentage;

  return price;
};

const isFillOrPartiallyFill = async orderId => {
  const fills = await doGetRequest({ uri: MY_FILLS_URI });
  const orderFilled = fills.find(fill => fill.orderId === orderId);

  if (orderFilled) {
    return true;
  }

  return false;
};

const tradingCycle = async () => {
  const ORDER_SIDE = 'buy';
  const price = await calculatePrice(ORDER_SIDE);

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

  // no tengo orden
  const order = await postOrder({ side: ORDER_SIDE, price });
  myOrders.push(order);
  console.log(`Posted ${ORDER_SIDE} order at ${price} dai. Id: `, order.id);
};

startCycle();
