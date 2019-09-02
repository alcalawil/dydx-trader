import {
  BigNumber,
  SigningMethod,
  MarketId,
  Solo,
  SignedLimitOrder,
  LimitOrder,
  ApiOrder
} from '@dydxprotocol/solo';
import { ISimpleOrder } from 'src/entities/types';

const DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';
const DEFAULT_EXPIRATION = process.env.DEFAULT_EXPIRATION || 0;

class OrdersManager {
  public solo: Solo;
  constructor(solo: Solo) {
    this.solo = solo;
  }

  private _createOrder({
    makerAmount,
    takerAmount,
    expiration,
    makerMarket,
    takerMarket
  }: ISimpleOrder): LimitOrder {
    const order: LimitOrder = {
      makerMarket: new BigNumber(makerMarket),
      takerMarket: new BigNumber(takerMarket),
      makerAmount: new BigNumber(makerAmount),
      takerAmount: new BigNumber(takerAmount),
      makerAccountOwner: DEFAULT_ADDRESS,
      makerAccountNumber: new BigNumber(0),
      takerAccountOwner: '0xf809e07870dca762B9536d61A4fBEF1a17178092', // TODO: Is this related to the taker market?
      takerAccountNumber: new BigNumber(0),
      expiration: new BigNumber(expiration || DEFAULT_EXPIRATION),
      salt: new BigNumber(Date.now())
    };

    return order;
  }

  private async _signOrder(order: LimitOrder): Promise<SignedLimitOrder> {
    const typedSignature = await this.solo.limitOrders.signOrder(
      order,
      SigningMethod.Hash
    );

    const signedOrder: SignedLimitOrder = {
      ...order,
      typedSignature
    };

    if (!this.solo.limitOrders.orderHasValidSignature(signedOrder)) {
      throw new Error('Invalid signature!'); // TODO: Export errors from a module
    }

    return signedOrder;
  }

  public async placeOrder(orderParams: ISimpleOrder) {
    const limitOrder = this._createOrder(orderParams);
    const signedOrder = await this._signOrder(limitOrder);
    const order = {
      ...signedOrder,
      fillOrKill: false
    };

    const { order: resultOrder } = await this.solo.api.placeOrder(order);

    return resultOrder;
  }

  public async placeBidOrder(ethAmount: string, daiAmount: string) {
    const limitOrder = this._createOrder({
      makerAmount: ethAmount,
      takerAmount: daiAmount,
      makerMarket: MarketId.WETH,
      takerMarket: MarketId.DAI
    });

    const signedOrder = await this._signOrder(limitOrder);
    const order = {
      ...signedOrder,
      fillOrKill: false
    };

    const { order: orderResponse } = await this.solo.api.placeOrder(order);

    return orderResponse;
  }

  public async placeAskOrder(ethAmount: string, daiAmount: string) {
    const limitOrder = this._createOrder({
      makerAmount: daiAmount,
      takerAmount: ethAmount,
      makerMarket: MarketId.DAI,
      takerMarket: MarketId.WETH
    });

    const signedOrder = await this._signOrder(limitOrder);
    const order = {
      ...signedOrder,
      fillOrKill: false
    };

    const { order: orderResponse } = await this.solo.api.placeOrder(order);

    return orderResponse;
  }

  public async cancelOrder(orderId: string) {
    const { order } = await this.solo.api.cancelOrder({
      orderId,
      makerAccountOwner: DEFAULT_ADDRESS
    });

    return order;
  }

  public async getOrders({
    account,
    limit = 10,
    startingBefore = new Date()
  }: {
    account?: string;
    limit?: number;
    startingBefore?: Date;
  }) {
    const { orders } = await this.solo.api.getOrders({
      startingBefore,
      limit,
      makerAccountOwner: account
    });

    return orders;
  }

  public async getOwnOrders(account = DEFAULT_ADDRESS) {
    return this.getOrders({ account });
  }

  public async getFills(account = DEFAULT_ADDRESS) {
    const { fills } = await this.solo.api.getFills({
      makerAccountOwner: account,
      startingBefore: new Date(),
      limit: 50
    });

    return fills;
  }
}

export default (solo: Solo) => new OrdersManager(solo);
