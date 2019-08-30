import { ISimpleOrder } from './types';
export class SimpleOrder implements ISimpleOrder {
  public id?: number;
  public expiration?: string;
  public makerMarket: number;
  public takerMarket: number;
  public takerAmount: string;
  public makerAmount: string;

  constructor(order: ISimpleOrder) {
    this.id = order.id || Date.now();
    this.expiration = order.expiration;
    this.makerMarket = order.makerMarket;
    this.takerMarket = order.takerMarket;
    this.takerAmount = order.takerAmount;
    this.makerAmount = order.makerAmount;
  }
}
