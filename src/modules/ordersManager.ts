import { BigNumber, SigningMethod, MarketId, Solo, SignedLimitOrder, LimitOrder,  } from '@dydxprotocol/solo';
import { ISimpleOrder } from 'src/entities/types';

const DEFAULT_ADDRESS = process.env.DEFAULT_ACCOUNT_ADDRESS || '';

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
    takerMarket,
  }: ISimpleOrder): LimitOrder {
    const order: LimitOrder = {
      makerAccountOwner: DEFAULT_ADDRESS,
      makerMarket: new BigNumber(makerMarket),
      takerMarket: new BigNumber(takerMarket),
      makerAmount: new BigNumber(makerAmount),
      takerAmount: new BigNumber(takerAmount),
      expiration: new BigNumber(expiration || 0),
      salt: new BigNumber(Date.now()),
      fillOrKill: false,
      takerAccountNumber: new BigNumber(0),
      makerAccountNumber: new BigNumber(0),
      takerAccountOwner: '0xf809e07870dca762B9536d61A4fBEF1a17178092' // TODO: Is this related to the taker market?
    };

    return order;
  }

  private async _signOrder(order): Promise<SignedLimitOrder> {
    const typedSignature = await this.solo.limitOrders.signOrder(
      order,
      SigningMethod.Hash
    );

    const signedOrder = {
      ...order,
      typedSignature
    };

    if (!this.solo.limitOrders.orderHasValidSignature(signedOrder)) {
      throw new Error('Invalid signature!');
    }

    return signedOrder;
  }

  public async placeSignedOrder(params) {
    const order = this._createOrder(params);
    const signedOrder = await this._signOrder(order);
    const resultOrder = await this.solo.api.placeOrder(signedOrder);
    return resultOrder;
  }

  public async placeBidOrder({ethAmount, daiAmount, expiration}) {
    const order = this._createOrder({ 
      makerAmount: this.solo.web3.utils.toWei(ethAmount, 'ether'), 
      takerAmount: this.solo.web3.utils.toWei(daiAmount,'ether'),
      expiration: expiration, 
      makerMarket: MarketId.WETH, 
      takerMarket: MarketId.DAI,
    });
    const signedOrder = await this._signOrder(order);
    const resultOrder = await this.solo.api.placeOrder(signedOrder);
    return resultOrder;
  }

  public async placeAskOrder({ethAmount, daiAmount, expiration}) {
    const order = this._createOrder({ 
      makerAmount: this.solo.web3.utils.toWei(daiAmount, 'ether'),
      takerAmount: this.solo.web3.utils.toWei(ethAmount, 'ether'),
      expiration: expiration, 
      makerMarket: MarketId.DAI, 
      takerMarket: MarketId.WETH,
    });
    const signedOrder = await this._signOrder(order);
    const resultOrder = await this.solo.api.placeOrder(signedOrder);
    return resultOrder;
  }

  public async getOrders({
    account = null, 
    limit = 10, 
    startingBefore = new Date()
  }) {
    const { orders } = await this.solo.api.getOrders({
      startingBefore,
      limit,
      makerAccountOwner: account
    });
    return orders;
  }

  public async getOwnOrders() {
    return this.getOrders(config.defaultAddress);
  }

  public async cancelOrder(id) {
    const { order } = await this.solo.api.cancelOrder({
      orderId: id,
      makerAccountOwner: config.defaultAddress,
    });
    return order;
  }

  public async getFills(account = null) {
    const { fills } = await this.solo.api.getFills({
      makerAccountOwner: account,
      startingBefore: new Date(),
      limit: 50,
    });
    return fills;
  }

  public async getOwnFills() {
    return this.getFills(config.defaultAddress);
  }
}

module.exports = (solo: Solo) => new OrdersManager(solo);
