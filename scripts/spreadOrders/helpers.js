const rp = require('request-promise');
const {  BUY_ORDER_URI, SELL_ORDER_URI, CANCEL_URI } = require('./constants');

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

const postOrder = async ({ price, side, amount, pair }) => {
  const { order } = side === 'sell'
    ? await doPostRequest({
        uri: BUY_ORDER_URI,
        body: {
          price,
          amount,
          pair
        }
      })
    : await doPostRequest({
        uri: SELL_ORDER_URI,
        body: {
          price,
          amount,
          pair
        }
    });

  return order;
};

const cancelOrder = async (orderId) => {
  // TODO: obtener el codigo del response y verificarlo

  const response = doPostRequest({
    uri: CANCEL_URI,
    body: {
      orderId: orderId
    }
  });

  return response;
};

class PriceDetail {
  constructor(ask, bid) {
    this.ask = ask;
    this.bid = bid;
    this.mid = (ask + bid) / 2;
  }
}

module.exports = { doGetRequest, doPostRequest, postOrder,  cancelOrder, PriceDetail };