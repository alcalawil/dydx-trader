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


// ========================================TRADING CYCLE ===============================================
const tradingCycle = async () => {
  const spreadOrders = new SpreadOrders(_range);
  // TODO: Use best-prices endpoint
  const { ask: dydxAsk } = await doGetRequest({ uri: GET_ASK_URI });
  const { bid: dydxBid } = await doGetRequest({ uri: GET_BID_URI });
  const hitbtcPrice = await doGetRequest({ uri: HITBTC_ETHDAI_TICKER });

  const internalPrice = new PriceDetail(dydxAsk, dydxBid);
  const externalPrice = new PriceDetail(hitbtcPrice.ask, hitbtcPrice.bid);
  
  // Cancel all
  await cancelOrders(_openOrders);
  
  // Generate orders from rules
  const cexOrders = spreadOrders.output({ internalPrice, externalPrice });
  
  // Post(orders)
  const responseOrders = await postMany(cexOrders);
}

// =============================================================================================

const postMany =  (cexOrders) => Promise.all(
  cexOrders.map(order => postOrder(order))
);

const cancelOrders = (orders) => Promise.all(
  orders.map((order) => cancelOrder(order.id))
);


      // // TODO: Poner un try catch para validar que la orden haya sido succes antes de guardarla
      // _myOrders.push(order);

      // // TODO: remover solo si el cancel fue success o si la orden fue cancelada antes
      // removeOrderFromRegistry(oldOrder.id);
      
      // const removeOrderFromRegistry = (orderId) => {
      //   _myOrders = _myOrders.filter(myOrder => myOrder.id !== orderId);
      // };
      

const startCycle = () => {
  tradingCycle();
  cycle = setInterval(tradingCycle, SECONDS_INTERVAL * 1000);
};

startCycle();