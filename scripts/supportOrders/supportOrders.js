const rp = require('request-promise');

/* ----------------------   PARÁMETROS CONFIGURABLES ------------------------------  */
const SECONDS_INTERVAL = parseFloat(process.env.SUPPORT_SECONDS_INTERVAL); // Cycle interval in seconds
const BASE_URI = process.env.BASE_URI;
// ----------------------------------------

const BUY_MANY_URI = BASE_URI + '/api/orders/buy-many';
const SELL_MANY_URI = BASE_URI + '/api/orders/sell-many';
const CANCEL_ORDER_URI = BASE_URI + '/api/orders/cancel';
const CANCEL_ALL_URI = BASE_URI + '/api/orders/cancel-all';

// Buy Many params
const BUY_MANY_BODY = {
  "amount": parseFloat(process.env.BUY_AMOUNT),
  "adjust": parseFloat(process.env.BUY_SEPARATION)
};

// Sell Many params
const SELL_MANY_BODY = {
  "amount": parseFloat(process.env.SELL_AMOUNT),
  "adjust": parseFloat(process.env.SELL_SEPARATION)
};

/* ---------------------------------------------------------------------------------- */
let myOrders = [];

const doRequest = async ({ uri, body = {} }) => {
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
    })
  } catch (error) {
    console.log(`[${new Date().toISOString()}]`, error.message);
  }

  return response;
}

const parseResponse = (response) => {
  if (!response) {
    return null;
  }
  return response.map(order => {
    return order.price;
  });
};

let counter = 1;

const postBuyOrders = async ()  => {
  const buyResponse = await doRequest({ uri: BUY_MANY_URI, body: BUY_MANY_BODY });
  myOrders.push(...buyResponse);
  console.log(`Posted ${buyResponse.length} BUY orders of amount: ${BUY_MANY_BODY.amount} at`, parseResponse(buyResponse));
};

const postSellOrders = async () => {
  const sellResponse = await doRequest({ uri: SELL_MANY_URI, body: SELL_MANY_BODY });
  myOrders.push(...sellResponse);
  console.log(`Posted ${sellResponse.length} SELL orders of amount: ${SELL_MANY_BODY.amount} at`, parseResponse(sellResponse));
};

const cancelOrders = async () => {
  const canceledOrders = await Promise.all(myOrders.map(async order => {
    const cancelResponse = await doRequest({ uri: CANCEL_ORDER_URI, body: { orderId: order.id }});

    // TODO: Use lodash to inspect properties
    if (cancelResponse && cancelResponse.result && cancelResponse.result.id) {
      myOrders = myOrders.filter(myOrder => myOrder.id !== order.id);
    }

  }));

  console.log(`Canceled ${canceledOrders.length} orders`);
};

const cycle = async () => {
  try {
    console.log(`${counter++} - Starting cycle at [${new Date().toISOString()}]`)

    // Cancel all of the orders
    await cancelOrders();
    console.log('-------------------------------------------------\n');
  
    // Buy Many
    await postBuyOrders();
    console.log('-------------------------------------------------\n');
  
    // Sell Many
    await postSellOrders();
    console.log('-------------------------------------------------\n');
  } catch (err) {
    console.log('***************** ERROR ******************');
    console.log(err);
    console.log('******************************************');
  }
};

cycle();

setInterval(cycle, SECONDS_INTERVAL * 1000);
