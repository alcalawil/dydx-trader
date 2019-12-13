// tslint:disable-next-line: no-var-requires
const aes256 = require('aes256'); // TODO: Convert to ES6 module
import BigNumber from 'bignumber.js';
import { IDexOrder, ICexOrder, MarketSide, IToken } from '@entities';
import { logger } from './Logger';
import { DYDX_TOKENS } from '../constants/Tokens';
import errorsConstants from '../constants/Errors';

export const calculatePrice = ({
  makerMarket,
  makerAmount,
  takerAmount
}: IDexOrder) => {
  // Sell side
  if (makerMarket === MarketSide.sell)
    return parseFloat(takerAmount) / parseFloat(makerAmount);

  // Buy side
  return parseFloat(makerAmount) / parseFloat(takerAmount);
};

export const convertToCexOrder = (dexOrder: IDexOrder): ICexOrder => {
  let cexOrder: ICexOrder;

  const makerAmount = new BigNumber(dexOrder.makerAmount);
  const takerAmount = new BigNumber(dexOrder.takerAmount);

  const takerToken = getTokenById(Number(dexOrder.takerMarket));
  const makerToken = getTokenById(Number(dexOrder.makerMarket));

  if (!takerToken || !makerToken) {
    throw new Error(errorsConstants.INVALID_TOKEN);
  }

  if (makerToken.isBase) {
    // it's buying
    cexOrder = {
      amount: convertFromWei(takerAmount, takerToken),
      price:
        (parseFloat(dexOrder.makerAmount) / parseFloat(dexOrder.takerAmount)) *
        Number(`1${makerToken.priceUnit}`),
      side: MarketSide.buy
    };
  } else {
    // it's selling
    cexOrder = {
      amount: convertFromWei(makerAmount, makerToken),
      price:
        (parseFloat(dexOrder.takerAmount) / parseFloat(dexOrder.makerAmount)) *
        Number(`1${takerToken.priceUnit}`),
      side: MarketSide.sell
    };
  }

  return cexOrder;
};

export const convertToDexOrder = (
  { price, amount, side }: ICexOrder,
  pair: string
): IDexOrder => {
  const [assetToken, baseToken] = getTokens(pair);

  // Sell side
  if (side === MarketSide.sell) {
    const takerAmount = price * amount;
    return {
      makerMarket: new BigNumber(assetToken.id),
      takerMarket: new BigNumber(baseToken.id),
      makerAmount: `${amount}${assetToken.weiUnit}`,
      takerAmount: `${takerAmount}${baseToken.weiUnit}`
    };
  }

  // buy side
  const makerAmount = price * amount;
  return {
    makerMarket: new BigNumber(baseToken.id),
    takerMarket: new BigNumber(assetToken.id),
    makerAmount: `${makerAmount}${baseToken.weiUnit}`,
    takerAmount: `${amount}${assetToken.weiUnit}`
  };
};

export const createRange = (first: number, last: number): number[] => {
  return Array.from(new Array(last - first + 1), (x, i) => i + first);
};

export const createPriceRange = (price: number, adjust = 1, side = 'sell'): number[] => {
  const prices: number[] = [];
  for (let i = 1; i <= 4; i += 1) {
    const adjustedPercentage = i * adjust;
    const adjustedPrice =
      side === 'sell'
        ? price + calculatePercentage(price, adjustedPercentage)
        : price - calculatePercentage(price, adjustedPercentage);
    prices.push(adjustedPrice);
  }
  logger.debug(`Price: ${price}, adjust: ${adjust}, side: ${side}`);

  return prices;
};

export const calculatePercentage = (
  inputVale: number,
  percentageNumber: number
): number => {
  return inputVale * (percentageNumber / 100);
};

export const decrypt = (key: string, dataEncrypted: string) => {
  return aes256.decrypt(key, dataEncrypted);
};

export const encrypt = (key: string, data: string) => {
  return aes256.decrypt(key, data);
};

export const convertToWei = (amount: number, tokenId: number): BigNumber => {
  const amountBG = new BigNumber(amount);
  const tokenFound = DYDX_TOKENS.find((token) => token.id === tokenId);
  if (!tokenFound) {
    throw new Error('Invalid or disabled token');
  }

  return amountBG.multipliedBy(`1${tokenFound.weiUnit}`);
};

export const convertFromWei = (wei: BigNumber, token: IToken): number => {
  return wei.dividedBy(`1${token.weiUnit}`).toNumber();
};

export const getTokens = (pair: string) => {
  const tokenNames = pair.split('-');

  let assetToken: IToken | undefined;
  let baseToken: IToken | undefined;

  // TODO: implement use case for the pair "SAI-USDC"
  DYDX_TOKENS.map((token: IToken) => {
    tokenNames.map((tokenName: string) => {
      if (token.shortName === tokenName) {
        if (token.isBase) baseToken = token;
        else assetToken = token;
      }
    });
  });

  if (!assetToken || !baseToken) throw new Error('Invalid pair');
  else return [assetToken, baseToken];
};

export const getTokenById = (tokenId: number) => {
  return DYDX_TOKENS.find((token) => token.id === tokenId);
};
