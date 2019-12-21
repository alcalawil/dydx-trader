import { BigNumber, ApiOrder, ApiOrderOnOrderbook, ApiFill } from '@dydxprotocol/solo';
import {
  MarketSide,
  ICexOrder,
  IDexOrder,
  IToken,
  IResponseOrder,
  MarketSideString,
  IParsedOrderbook,
  IResponseFill,
  IResponseTrade
} from '@entities';
import { DYDX_TOKENS } from '../constants/Tokens';
import { getTokenById } from '@shared';
import ERRORS from '../constants/Errors';

// TODO: Hacer que el pair venga dentro de la cexOrder
export const convertToDexOrder = (
  { price, amount, side }: ICexOrder,
  pair: string
): IDexOrder => {
  const [assetToken, baseToken] = getTokensFromPair(pair);

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

export const getTokensFromPair = (pair: string) => {
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

export const convertToCexOrder = (dexOrder: IDexOrder): ICexOrder => {
  let cexOrder: ICexOrder;

  const makerAmount = new BigNumber(dexOrder.makerAmount);
  const takerAmount = new BigNumber(dexOrder.takerAmount);

  const takerToken = getTokenById(Number(dexOrder.takerMarket));
  const makerToken = getTokenById(Number(dexOrder.makerMarket));

  if (!takerToken || !makerToken) {
    throw new Error(ERRORS.INVALID_TOKEN);
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

export const convertToResponseOrder = (orderApi: ApiOrder): IResponseOrder => {
  const {
    id,
    pair,
    createdAt,
    expiresAt,
    makerAmount,
    takerAmount,
    status,
    makerAmountRemaining,
    takerAmountRemaining,
    makerAccountOwner
  } = orderApi;

  const { price, amount, side } = convertToCexOrder({
    makerMarket: pair.makerCurrency.soloMarket,
    takerMarket: pair.takerCurrency.soloMarket,
    makerAmount,
    takerAmount
  });

  const { amount: amountRemaining } = convertToCexOrder({
    makerMarket: pair.makerCurrency.soloMarket,
    takerMarket: pair.takerCurrency.soloMarket,
    makerAmount: makerAmountRemaining,
    takerAmount: takerAmountRemaining
  });

  const responseOrder: IResponseOrder = {
    id,
    account: makerAccountOwner,
    pair: pair.name,
    side: MarketSideString[side],
    createdAt,
    expiresAt,
    price,
    amount,
    status,
    amountFilled: amount - amountRemaining,
    amountRemaining
  };

  return responseOrder;
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

export const parseApiOrderbook = (
  apiOrderbook: ApiOrderOnOrderbook,
  assetToken: IToken,
  baseToken: IToken
): IParsedOrderbook => {
  const { price, amount } = apiOrderbook;
  return {
    price: parseFloat(price) * Number(`1${baseToken.priceUnit}`),
    amount: convertFromWei(new BigNumber(amount), assetToken)
  };
};

export const parseApiFill = (fillApi: ApiFill): IResponseFill => {
  const { orderId, transactionHash, order, createdAt, updatedAt, status } = fillApi;
  const {
    makerAmount,
    takerAmount,
    pair,
    makerAmountRemaining,
    takerAmountRemaining
  } = order;

  const { price, side, amount } = convertToCexOrder({
    makerMarket: pair.makerCurrency.soloMarket,
    takerMarket: pair.takerCurrency.soloMarket,
    makerAmount,
    takerAmount
  });

  const { amount: amountRemaining } = convertToCexOrder({
    makerMarket: pair.makerCurrency.soloMarket,
    takerMarket: pair.takerCurrency.soloMarket,
    makerAmount: makerAmountRemaining,
    takerAmount: takerAmountRemaining
  });

  const responseOrder: IResponseFill = {
    transactionHash,
    orderId,
    pair: pair.name,
    side: MarketSideString[side],
    createdAt,
    updatedAt,
    price,
    amount,
    fillStatus: status,
    orderStatus: order.status,
    amountFilled: amount - amountRemaining,
    amountRemaining
  };

  return responseOrder;
};

// TODO: Agregar el tradeApi type
export const parseApiTrade = (tradeApi: any): IResponseTrade => {
  const {
    transactionHash,
    makerOrder,
    createdAt,
    makerAmount,
    takerAmount,
    status
  } = tradeApi;

  const { price, amount, side } = convertToCexOrder({
    makerMarket: makerOrder.pair.makerCurrency.soloMarket,
    takerMarket: makerOrder.pair.takerCurrency.soloMarket,
    makerAmount,
    takerAmount
  });

  const responseTrade: IResponseTrade = {
    transactionHash,
    pair: makerOrder.pair.name,
    side: MarketSideString[side],
    createdAt,
    price,
    amount,
    status
  };

  return responseTrade;
};
