import { IDexOrder, ICexOrder } from '../entities/types';
import BigNumber from 'bignumber.js';
import web3 from 'web3';
import { logger } from './Logger';
// tslint:disable-next-line: no-var-requires
const aes256 = require('aes256'); // TODO: Convert to ES6 module

// TODO: Use enum from types
const MarketSide = {
  sell: 0,
  buy: 1
};

export const calculatePrice = ({
  makerMarket,
  takerMarket,
  makerAmount,
  takerAmount
}: IDexOrder) => {

  // Sell side
  if (makerMarket === 0) {
    return parseFloat(takerAmount) / parseFloat(makerAmount);
  }

  // Buy side
  return parseFloat(makerAmount) / parseFloat(takerAmount);
};

export const convertToCexOrder = ({
  makerMarket,
  takerMarket,
  makerAmount,
  takerAmount
}: IDexOrder): ICexOrder => {
  // Sell side
  const makerAmountBG = new BigNumber(makerAmount);
  const takerAmountBG = new BigNumber(takerAmount);

  // TODO: Use MarketId

  if (Number(makerMarket) === 0) {
    const sellAmount = Number(web3.utils.fromWei(makerAmountBG.toString(), 'ether'));
    const sellPrice = parseFloat(takerAmount) / parseFloat(makerAmount);

    return {
      price: sellPrice,
      amount: sellAmount,
      side: MarketSide.sell
    };
  }

  // Buy side
  const buyAmount = Number(web3.utils.fromWei(takerAmountBG.toString(), 'ether'));
  const buyPrice = parseFloat(makerAmount) / parseFloat(takerAmount);

  return {
    price: buyPrice,
    amount: buyAmount,
    side: MarketSide.buy
  };
};

export const convertToDexOrder = ({ price, amount, side }: ICexOrder): IDexOrder => {
  // Sell side
  if (side === 0) {
    const takerAmount = price * amount;
    return {
      makerMarket: new BigNumber(0),
      takerMarket: new BigNumber(1),
      takerAmount: `${takerAmount}e18`,
      makerAmount: `${amount}e18`
    };
  }

  // buy side
  const makerAmount = price * amount;
  return {
    makerMarket: new BigNumber(1),
    takerMarket: new BigNumber(0),
    takerAmount: `${amount}e18`,
    makerAmount: `${makerAmount}e18`
  };
};

export const createRange = (first: number, last: number): number[] => {
  return Array.from(new Array(last - first + 1), (x, i) => i + first);
};

export const createPriceRange = (price: number, adjust = 1, side = 'sell'): number[] => {
  const prices: number[] = [];
  for (let i = 1; i <= 4; i += 1) {
    const adjustedPercentage = i * adjust;
    const adjustedPrice = side === 'sell'
    ? price + calculatePercentage(price, adjustedPercentage)
    : price - calculatePercentage(price, adjustedPercentage);
    prices.push(adjustedPrice);
  }
  logger.debug(`Price: ${price}, adjust: ${adjust}, side: ${side}`);

  return prices;
};

export const calculatePercentage = (inputVale: number, percentageNumber: number): number => {
  return (inputVale * (percentageNumber / 100));
};

export const decrypt = (key: string, dataEncrypted: string) => {
  return aes256.decrypt(key, dataEncrypted);
};

export const encrypt = (key: string, data: string) => {
  return aes256.decrypt(key, data);
};
