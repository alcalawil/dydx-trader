const SECONDS_INTERVAL = parseFloat(process.env.HEAD_SECONDS_INTERVAL) || 60; // Cycle interval in seconds
const BASE_URI = process.env.BASE_URI || 'http://localhost:3000';
const BUY_ORDER_URI = BASE_URI + '/api/orders/buy';
const SELL_ORDER_URI = BASE_URI + '/api/orders/sell';
const GET_BID_URI = BASE_URI + '/api/orders/bid';
const GET_ASK_URI = BASE_URI + '/api/orders/ask';
const MY_FILLS_URI = BASE_URI + '/api/orders/myfills';
const CANCEL_URI = BASE_URI + '/api/orders/cancel';
const HITBTC_BASE_URI = process.env.HITBTC_BASE_URI;
const HITBTC_ETHDAI_TICKER = HITBTC_BASE_URI + '/ticker/ethdai';

const DEFAULT_AMOUNT = parseFloat(process.env.DEFAULT_AMOUNT) || 0.1;
const DEFAULT_PAIR = process.env.DEFAULT_PAIR || 'WETH-DAI';
const ORDER_SIDE = process.env.ORDER_SIDE || 'sell';

const _range = [
  {
    spread: 0.25,
    amount: 1
  },
  {
    spread: 0.5,
    amount: 1
  },
  {
    spread: 0.75,
    amount: 1
  }
];

module.exports = { 
  _range, 
  BUY_ORDER_URI,
  SELL_ORDER_URI,
  GET_BID_URI,
  GET_ASK_URI,
  MY_FILLS_URI,
  CANCEL_URI,
  HITBTC_BASE_URI,
  HITBTC_ETHDAI_TICKER,
  DEFAULT_AMOUNT,
  DEFAULT_PAIR,
  ORDER_SIDE,
  SECONDS_INTERVAL
};
