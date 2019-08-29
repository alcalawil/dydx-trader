import { IOrder } from './types';
export class User implements IOrder {
  public id?: number;
  public expiration: string;
  public takerAmount: string;
  public makerAmount: string;

  constructor(order: IOrder) {
    this.id = order.id || Date.now();
    this.expiration = order.expiration;
    this.takerAmount = order.takerAmount;
    this.makerAmount = order.makerAmount;
  }
}
