import BigNumber from 'bignumber.js';

export interface ISimpleOrder {
  id?: number;
  expiration?: number;
  takerAmount: string;
  makerAmount: string;
  takerMarket: BigNumber | number;
  makerMarket: BigNumber | number;
}

export interface IResponseOrder {
  id: string;
  pair: string;
  type: string;
  createdAt: string;
  expiresAt: string | undefined;
  price: number;
  amount: number;
  status: string;
}

export interface IError {
  status?: number;
  message?: string;
}

export interface IBalances {
  eth: string;
  dai: string;
}
