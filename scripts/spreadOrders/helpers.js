const rp = require('request-promise');
const { BUY_ORDER_URI, SELL_ORDER_URI, CANCEL_URI, GET_ORDER_URI } = require('./constants');

const doPostRequest = async ({ uri, body = {} }) => {
  return rp.post({
    uri,
    body,
    json: true,
    headers: {
      'User-Agent': 'Request-Promise',
      'api-key': process.env.OPERATOR_API_KEY ||  '12345'
    }
  });
};

const doGetRequest = async ({ uri }) => {
  return rp.get({
    uri,
    json: true,
    headers: {
      'User-Agent': 'Request-Promise',
      'api-key': process.env.OPERATOR_API_KEY || '12345'
    }
  });
};

const postOrder = async ({ price, side, amount, pair }) => {
  try {
    const response = side === 'sell'
    ? await doPostRequest({
      uri: SELL_ORDER_URI,
      body: {
        price,
        amount,
        pair
      }
    })
    : await doPostRequest({
      uri: BUY_ORDER_URI,
      body: {
        price,
        amount,
        pair
      }
    });

    return response.order;
  } catch (err) {
    console.log(err.message);
  }
};

const cancelOrder = async (orderId) => {
  try {
    const { result: order } = await doPostRequest({
      uri: CANCEL_URI,
      body: {
        orderId: orderId
      }
    });

    console.log(order)
    return order;
  } catch (err) {
    console.log(err.message);
  }
};

const getOrderById = async (orderId) => {
  try {
    const uri = `${GET_ORDER_URI}?id=${orderId}`; 
    return doGetRequest({ uri });
  } catch (err) {
    console.log(err.message);
  }
};

class PriceDetail {
  constructor(ask, bid) {
    this.ask = ask;
    this.bid = bid;
    this.mid = (ask + bid) / 2;
  }
}

module.exports = { 
  doGetRequest, 
  doPostRequest, 
  postOrder, 
  cancelOrder, 
  PriceDetail,
  getOrderById
};
