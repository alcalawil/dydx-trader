export interface ISimpleOrder {
  id?: number;
  expiration?: string;
  takerAmount: string;
  makerAmount: string;
  takerMarket: number;
  makerMarket: number;
}

export interface IError {
  status?: number;
  message?: string;
}
