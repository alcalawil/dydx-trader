import BigNumber from 'bignumber.js';

export interface ISimpleOrder extends IDexOrder {
  id?: number;
  expiration?: number;
}

// Standard order used by DEX protocols
export interface IDexOrder {
  takerAmount: string;
  makerAmount: string;
  takerMarket: BigNumber | number;
  makerMarket: BigNumber | number;
}

export interface ICexOrder {
  price: number;
  amount: number;
  side: number;
}

export const MarketSide = {
  sell: 0,
  buy: 1
};

export interface IResponseOrder {
  id: string;
  pair: string;
  side: string;
  createdAt: string;
  expiresAt: string | undefined;
  price: number;
  amount: number;
  status: string;
  amountFilled?: number;
  amountRemaining?: number;
}

export interface IError {
  status?: number;
  message?: string;
}

export interface IBalances {
  eth: string;
  dai: string;
}

export interface IOrderbook {
  sellOrders: IResponseOrder[];
  buyOrders: IResponseOrder[];
}

export interface IResponseTrade {
  transactionHash: string;
  pair: string;
  side: string;
  createdAt: string;
  price: number;
  amount: number;
  status: string;
}

export interface IResponseFill {
  transactionHash: string;
  orderId: string;
  pair: string;
  side: string;
  createdAt: string;
  updatedAt: string;
  price: number;
  amount: number;
  fillAmount: number;
  fillStatus: string;
  orderStatus: string;
}
