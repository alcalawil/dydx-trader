const SECONDS_INTERVAL_SPREAD = parseFloat(process.env.SECONDS_INTERVAL_SPREAD) || 10; // Cycle interval in seconds
const BASE_URI = process.env.BASE_URI || 'http://localhost:3000';
const BUY_ORDER_URI = BASE_URI + '/api/orders/buy';
const SELL_ORDER_URI = BASE_URI + '/api/orders/sell';
const GET_BID_URI = BASE_URI + '/api/orders/bid';
const GET_ASK_URI = BASE_URI + '/api/orders/ask';
const MY_FILLS_URI = BASE_URI + '/api/orders/myfills';
const CANCEL_URI = BASE_URI + '/api/orders/cancel';
const HITBTC_BASE_URI = process.env.HITBTC_BASE_URI;
const HITBTC_ETHDAI_TICKER = HITBTC_BASE_URI + '/ticker/ethdai';
const HITBTC_ETHUSDC_TICKER = HITBTC_BASE_URI + '/ticker/ethusdc';

const GET_ORDER_URI = BASE_URI + '/api/orders/order';

const DEFAULT_AMOUNT = parseFloat(process.env.DEFAULT_AMOUNT) || 0.1;
const DEFAULT_PAIR = process.env.DEFAULT_PAIR || 'WETH-DAI';
const ORDER_SIDE = process.env.ORDER_SIDE || 'sell';

const USE_EXTERNAL_PRICE = process.env.USE_EXTERNAL_PRICE === 'TRUE'
  ? true
  : false;

const _range = [
  {
    bid: {
      spread: 0.125,
      amount: 0.111
    },
    ask: {
      spread: 0.125,
      amount: 0.101
    }
  },
  {
    bid: {
      spread: 0.25,
      amount: 0.112
    },
    ask: {
      spread: 0.25,
      amount: 0.102
    }
  },
  {
    bid: {
      spread: 0.3,
      amount: 0.113
    },
    ask: {
      spread: 0.3,
      amount: 0.103
    }
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
  SECONDS_INTERVAL_SPREAD,
  GET_ORDER_URI,
  USE_EXTERNAL_PRICE,
  HITBTC_ETHUSDC_TICKER
};
