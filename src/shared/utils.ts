import { IDexOrder, ICexOrder } from '../entities/types';
import BigNumber from 'bignumber.js';
import web3 from 'web3';

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

export const createCustomRange = (): number[] => {
  return [ 2, 4, 8, 15 ];
};

export const calculatePercentage = (inputVale: number, percentageNumber: number): number => {
  return (inputVale * (percentageNumber / 100));
};
