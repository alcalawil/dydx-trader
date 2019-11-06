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
  SECONDS_INTERVAL,
  DEFAULT_PAIR
} = require('./constants');

const updateOrders = async (orders) => {
  const updatedOrders = await Promise.all(
    orders.map(async (order) => {
      const newOrder = await getOrderById(order.id);
      return newOrder || order;
    })
  );

  return updatedOrders;
};

const cancelOrders = async (orders) => {
  const cancelledOrders = await Promise.all(
    orders.map(async (order) => cancelOrder(order.id))
  );

  return cancelledOrders.filter(order => order);
};

const orders = [
  {
    id: '0xb9b35399788447ab94ca6afe4ea87cb29d3d905da6debec5ac1fead43b5fdb49'
  },
  {
    id: '0x788e831d82c14924f713d02967c92d99764fab1aecef50089c4c4abc483ff36e'
  },
  {
    id: '0xfa0d575911f22248bbbcf80b3c50be70072c371872c326774d8505566e333b8e'
  }
];

(async () => {
  // const resp = await updateOrders(orders);
  const resp = await cancelOrders(orders);
  console.log(resp);
})();
