import {
  BigNumber,
  SigningMethod,
  MarketId,
  Solo,
  SignedLimitOrder,
  LimitOrder,
  ApiOrder
} from '@dydxprotocol/solo';
import { ISimpleOrder, IResponseOrder } from 'src/entities/types';
import { calculatePrice } from 'src/shared/utils';

// Config
const DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';
const DEFAULT_EXPIRATION = parseInt(process.env.DEFAULT_EXPIRATION_IN_SECONDS || '600');

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
      expiration: new BigNumber(DEFAULT_EXPIRATION),
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
    const parsedOrder = this.parseApiOrder(resultOrder);

    return parsedOrder;
  }

  public async buy(makerAmount: string, takerAmount: string) {
    const limitOrder = this._createOrder({
      makerAmount,
      takerAmount,
      makerMarket: MarketId.DAI,
      takerMarket: MarketId.WETH
    });

    const signedOrder = await this._signOrder(limitOrder);
    const order = {
      ...signedOrder,
      fillOrKill: false
    };

    const { order: responseOrder } = await this.solo.api.placeOrder(order);
    const parsedOrder = this.parseApiOrder(responseOrder);

    return parsedOrder;
  }

  public async sell(makerAmount: string, takerAmount: string) {
    const limitOrder = this._createOrder({
      makerAmount,
      takerAmount,
      makerMarket: MarketId.WETH,
      takerMarket: MarketId.DAI
    });

    const signedOrder = await this._signOrder(limitOrder);
    const order = {
      ...signedOrder,
      fillOrKill: false
    };

    const { order: responseOrder } = await this.solo.api.placeOrder(order);
    const parsedOrder = this.parseApiOrder(responseOrder);

    return parsedOrder;
  }

  public async cancelOrder(orderId: string) {
    const { order } = await this.solo.api.cancelOrder({
      orderId,
      makerAccountOwner: DEFAULT_ADDRESS
    });

    const parsedOrder = this.parseApiOrder(order);

    return parsedOrder;
  }

  public async getOrders({
    account,
    limit = 10,
    startingBefore = new Date(),
    pairs = ['WETH-DAI', 'DAI-WETH']
  }: {
    account?: string;
    limit?: number;
    startingBefore?: Date;
    pairs?: string[]
  }) {
    const { orders } = await this.solo.api.getOrders({
      startingBefore,
      limit,
      makerAccountOwner: account,
      pairs
    });

    return orders;
  }

  public async getOwnOrders(account = DEFAULT_ADDRESS) {
    const apiOrders = await this.getOrders({ account });
    const parsedOrders = apiOrders.map((apiOrder) => this.parseApiOrder(apiOrder));
    return parsedOrders;
  }

  public async getOrderById(orderId: string): Promise<IResponseOrder> {
    const { order } = await this.solo.api.getOrder({ id: orderId });
    const responseOrder = this.parseApiOrder(order);

    return responseOrder;
  }

  public async getOrderbook({ limit }: { limit: number }) {
    // TODO: Order as an Orderbook --> buy and sell separated
    const apiOrders = await this.getOrders({ limit });
    const parsedOrders = apiOrders.map((apiOrder) => this.parseApiOrder(apiOrder));
    return parsedOrders;
  }

  public async getMyFills(limit = 50) {
    const { fills } = await this.solo.api.getFills({
      makerAccountOwner: DEFAULT_ADDRESS,
      startingBefore: new Date(),
      limit: 50
    });

    return fills;
  }

  public async getBid() {
    const apiOrders = await this.getOrders({ limit: 3, pairs: ['DAI-WETH'] });
    const orders = apiOrders.map(this.parseApiOrder.bind(this));
    const bidPrice = orders.sort((a: IResponseOrder, b: IResponseOrder) => {
      return Number(b.price) - Number(a.price);
    })[0].price;

    return { bidPrice };
  }

  public async getAsk() {
    // TODO: ask to dydx if there is aa way to pass an orderBy param
    const apiOrders = await this.getOrders({ limit: 10, pairs: ['WETH-DAI'] });
    const orders = apiOrders.map(this.parseApiOrder.bind(this));
    const askPrice = orders.sort(this.sortOrderByAscPrice)[0].price;
    return { askPrice };
  }

  private sortOrderByAscPrice(a: IResponseOrder, b: IResponseOrder) {
    return Number(a.price) - Number(b.price);
  }

  private async cancelAllOrder(account: string) {
    const orders = await this.getOwnOrders(account);
    const ordersCanceled = Array<IResponseOrder>();
    await orders.forEach(async (order) => {
      ordersCanceled.push(await this.cancelOrder(order.id));
    });

    return orders;
  }

  public async cancelAllOwnOrder(account = DEFAULT_ADDRESS) {
    const orders = await this.cancelAllOrder(account);
    return orders;
  }

  public async generateOrders(amount: number, type: string, separation: number = 1) {
    const percentages = [
      { index: 0, value: 2 },
      { index: 1, value: 4 },
      { index: 2, value: 8 },
      { index: 3, value: 15 },
    ];
    const readyOrders = Array<IResponseOrder>();

    for (const { value } of percentages) {
      const newValue = value * separation;
      if (type.includes('buy')) {
        const { bidPrice } = await this.getBid();
        const makerAmount = `${this.calcAmount(Number(bidPrice), amount, newValue, type)}e18`;
        const takerAmount = `${amount}e18`;
        const order = await this.buy(makerAmount, takerAmount);
        readyOrders.push(order);
      } else if (type.includes('sell')) {
        const { askPrice } = await this.getAsk();
        const takerAmount = `${this.calcAmount(Number(askPrice), amount, newValue, type)}e18`;
        const makerAmount = `${amount}e18`;
        const order = await this.sell(makerAmount, takerAmount);
        readyOrders.push(order);
      }
    }

    return readyOrders;
  }

  private calcAmount(price: number, amount: number, percentage: number, type: string) {
    let result = 0;
    let newPrice = 0;

    if (type.includes('buy')) {
      newPrice = price - (price * (percentage / 100));
      result = amount / newPrice;
    } else if (type.includes('sell')) {
      newPrice = price + (price * (percentage / 100));
      result = newPrice * amount;
    }

    return result;
  }

  private parseApiOrder(orderApi: ApiOrder): IResponseOrder {
    const { id, pair, createdAt, expiresAt, makerAmount, takerAmount, status } = orderApi;

    const makerMarket = pair.makerCurrency.soloMarket;
    const price = calculatePrice({
      makerMarket: pair.makerCurrency.soloMarket,
      takerMarket: pair.takerCurrency.soloMarket,
      makerAmount,
      takerAmount
    });

    let type: string;
    let amount: string;

    if (makerMarket === MarketId.WETH.toNumber()) {
      type = 'SELL'; // Si estoy ofreciendo WETH, significa que estoy vendiendo
      amount = this.solo.web3.utils.fromWei(makerAmount, 'ether');
    } else {
      type = 'BUY';
      amount = this.solo.web3.utils.fromWei(takerAmount, 'ether');
    }

    const responseOrder: IResponseOrder = {
      id,
      pair: 'ETH-DAI',
      type,
      createdAt,
      expiresAt,
      price,
      amount: parseFloat(amount),
      status
    };

    return responseOrder;
  }
}

export default (solo: Solo) => new OrdersManager(solo);
