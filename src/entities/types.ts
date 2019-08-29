export interface IOrder {
  id?: number;
  expiration: string;
  takerAmount: string;
  makerAmount: string;
}

export interface IError {
  status?: number;
  message?: string;
}
