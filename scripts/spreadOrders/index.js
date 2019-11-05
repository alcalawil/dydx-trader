const SpreadOrders = require('./SpreadOrders');
const {
  doGetRequest,
  PriceDetail,
  cancelOrder,
  postOrder
} = require('./helpers');
const {
  _range,
  GET_ASK_URI,
  GET_BID_URI,
  HITBTC_ETHDAI_TICKER,
  SECONDS_INTERVAL,
  DEFAULT_PAIR
} = require('./constants');


const spreadOrders = new SpreadOrders(_range, DEFAULT_PAIR);
let _myOrders = [];

// ========================================TRADING CYCLE ===============================================
const tradingCycle = async () => {
  // TODO: Use best-prices endpoint
  const { ask: dydxAsk } = await doGetRequest({ uri: GET_ASK_URI });
  const { bid: dydxBid } = await doGetRequest({ uri: GET_BID_URI });
  const hitbtcPrice = await doGetRequest({ uri: HITBTC_ETHDAI_TICKER });

  const internalPrice = new PriceDetail(dydxAsk, dydxBid);
  const externalPrice = new PriceDetail(parseFloat(hitbtcPrice.ask), parseFloat(hitbtcPrice.bid));

  // Cancel all
  if (_myOrders.length > 0) {
    const cancelledOrders = cancelOrders(_myOrders);
    // Que pasara con las ordenes que por X razon no fueron canceladas?
    // TODO: remover solo si el cancel fue success o si la orden fue cancelada antes
    cancelledOrders.map(canceledOrder =>
      removeOrderFromRegistry(canceledOrder.id)
    );
  }
  // Generate new orders from rules
  const cexOrders = spreadOrders.outputOrders({ internalPrice, externalPrice });
  // console.log(cexOrders);
  // Post generated orders
  const responseOrders = await postMany(cexOrders);
  // Save successfully posted orders in registry
  _myOrders = responseOrders;
}

// =============================================================================================

const postMany = async (cexOrders) => {
  const postedOrders = await Promise.all(
    cexOrders.map(order => postOrder(order))
  );
  const successPostedOrders = postedOrders.filter(order => order);
  return successPostedOrders;
};

const cancelOrders = async (orders) => {
  const cancelledOrders = await Promise.all(
    orders.map(async (order) => cancelOrder(order.id))
  );
  const successCancelledOrders = cancelledOrders.filter(order => order);
  return successCancelledOrders;
};

const removeOrderFromRegistry = (orderId) => {
  _myOrders = _myOrders.filter(myOrder => myOrder.id !== orderId);
};


const startCycle = () => {
  tradingCycle();
  cycle = setInterval(tradingCycle, SECONDS_INTERVAL * 1000);
};

startCycle();