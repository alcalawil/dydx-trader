const SpreadOrders = require('./SpreadOrders');
const {
  doGetRequest,
  PriceDetail,
  cancelOrder,
  postOrder,
  getOrderById
} = require('./helpers');
const {
  _range,
  GET_ASK_URI,
  GET_BID_URI,
  HITBTC_ETHDAI_TICKER,
  SECONDS_INTERVAL_SPREAD,
  DEFAULT_PAIR,
  GET_ORDER_URI
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
  
  console.log('My orders:', _myOrders);
  
  // Cancel all
  if (_myOrders.length > 0) {
    _myOrders = await updateOrders(_myOrders);
    const openOrders = _myOrders.filter(order => order.status === 'OPEN');
    const cancelledOrders = await cancelOrders(openOrders);

    cancelledOrders.map(canceledOrder =>
      removeOrderFromRegistry(canceledOrder.id)
    );
  }
  // Generate new orders from rules
  const cexOrders = spreadOrders.outputOrders({ internalPrice, externalPrice });
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

  return postedOrders.filter(order => order);
};

const cancelOrders = async (orders) => {
  const cancelledOrders = await Promise.all(
    orders.map(async (order) => cancelOrder(order.id))
  );

  return cancelledOrders.filter(order => order);
};

const removeOrderFromRegistry = (orderId) => {
  _myOrders = _myOrders.filter(myOrder => myOrder.id !== orderId);
};

const updateOrders = async (orders) => {
  if (!orders.length) {
    return [];
  } 
  const updatedOrders = await Promise.all(
    orders.map(async (order) => {
      console.log('Order id: ', order.id)
      const newOrder = await getOrderById(order.id);
      return newOrder || order;
    })
  );

  return updatedOrders;
};

const startCycle = () => {
  tradingCycle();
  cycle = setInterval(tradingCycle, SECONDS_INTERVAL_SPREAD * 1000);
};

startCycle();
