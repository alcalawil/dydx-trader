import BigNumber from 'bignumber.js';

export interface ISimpleOrder {
  id?: number;
  expiration?: number;
  takerAmount: string;
  makerAmount: string;
  takerMarket: BigNumber;
  makerMarket: BigNumber;
}

export interface IError {
  status?: number;
  message?: string;
}
