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
  SECONDS_INTERVAL
} = require('./constants');


const spreadOrders = new SpreadOrders(_range);
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
  const canceledOrders = await cancelOrders(_myOrders);

  // Remove all canceled orders
  // TODO: remover solo si el cancel fue success o si la orden fue cancelada antes
  canceledOrders.map(canceledOrder =>
    removeOrderFromRegistry(canceledOrder.id)
  );

  // Generate new orders from rules
  const cexOrders = spreadOrders.outputOrders({ internalPrice, externalPrice });

  // Post generated orders
  const responseOrders = await postMany(cexOrders);
  // Save successfully posted orders in registry
  _myOrders = responseOrders;
}

// =============================================================================================

// TODO: Handlear errores para que retorne solamente ordenes correctamente posteadas
const postMany = (cexOrders) => Promise.all(
  cexOrders.map(order => postOrder(order))
);

// TODO: Handlear errores para que retorne solo responses de ordenes correctamente canceladas
const cancelOrders = (orders) => Promise.all(
  orders.map((order) => cancelOrder(order.id))
);

const removeOrderFromRegistry = (orderId) => {
  _myOrders = _myOrders.filter(myOrder => myOrder.id !== orderId);
};


const startCycle = () => {
  tradingCycle();
  cycle = setInterval(tradingCycle, SECONDS_INTERVAL * 1000);
};

startCycle();