const rp = require('request-promise');

/* ----------------------   PARÁMETROS CONFIGURABLES ------------------------------  */
const SECONDS_INTERVAL = parseFloat(process.env.SUPPORT_SECONDS_INTERVAL); // Cycle interval in seconds
const BASE_URI = process.env.BASE_URI;
// ----------------------------------------

const CANCEL_ALL_URI = BASE_URI + '/api/orders/cancel-all';
const BUY_MANY_URI = BASE_URI + '/api/orders/buy-many';
const SELL_MANY_URI = BASE_URI + '/api/orders/sell-many';

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

const cycle = async () => {
  try {
    console.log(`${counter++} - Starting cycle at [${new Date().toISOString()}]`)
    // Cancel all of the orders
    const cancelResponse = await doRequest({ uri: CANCEL_ALL_URI });
    console.log(`Canceled ${cancelResponse.count} orders`);
    console.log('-------------------------------------------------\n');
  
    // Buy Many
    const buyResponse = await doRequest({ uri: BUY_MANY_URI, body: BUY_MANY_BODY });
    console.log(`Posted ${buyResponse.length} BUY orders at`, parseResponse(buyResponse));
    console.log('-------------------------------------------------\n');
  
    // Sell Many
    const sellResponse = await doRequest({ uri: SELL_MANY_URI, body: SELL_MANY_BODY });
    console.log(`Posted ${sellResponse.length} SELL orders at`, parseResponse(sellResponse));
    console.log('-------------------------------------------------\n');
  } catch (err) {
    console.log('***************** ERROR ******************');
    console.log(err);
    console.log('******************************************');
  }
};

cycle();

setInterval(cycle, SECONDS_INTERVAL * 1000);
