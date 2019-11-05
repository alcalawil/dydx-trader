const rp = require('request-promise');

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

};

class PriceDetail {
  constructor(ask, bid) {
    this.ask = ask;
    this.bid = bid;
    this.mid = (ask + bid) / 2;
  }
}

module.exports = { doGetRequest, doPostRequest, postOrder,  cancelOrder, PriceDetail };