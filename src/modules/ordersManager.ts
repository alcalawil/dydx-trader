import {
  BigNumber,
  SigningMethod,
  Solo,
  SignedLimitOrder,
  LimitOrder,
  ApiOrder,
  ApiFill,
  ApiMarketName,
  ApiOrderOnOrderbook
} from '@dydxprotocol/solo';

import {
  IResponseOrder,
  MarketSide,
  IOrderbook,
  IResponseFill,
  ICexOrder,
  IDexOrder,
  MarketSideString,
  IParsedOrderbook,
  IToken,
  IRedisManager,
  observerEvents
} from '../entities/types';
import {
  createPriceRange,
  convertToDexOrder,
  getTokens,
  convertToCexOrder,
  convertFromWei
} from '../shared/utils';
import awsManager from './awsManager';
import errorsConstants from '../shared/errorsConstants';
import _ from 'lodash';
import { EventEmitter } from 'events';

// Config
let DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';
const DEFAULT_EXPIRATION = parseInt(process.env.DEFAULT_EXPIRATION_IN_SECONDS || '610');
const ENCRYPTED_PRIVATE_KEY = process.env.ENCRYPTED_PRIVATE_KEY || '';
const ENCRYPTED_DEFAULT_ADDRESS = process.env.ENCRYPTED_DEFAULT_ADDRESS || '';
const TAKER_ACCOUNT_OWNER =
  process.env.TAKER_ACCOUNT || '0x0000000000000000000000000000000000000000';

class OrdersManager {
  public solo: Solo;
  private redisManager: any;
  private observerEmitter: any;

  constructor(solo: Solo, observerEmitter?: EventEmitter, redis?: IRedisManager) {
    this.solo = solo;
    this.redisManager = redis;
    this.observerEmitter = observerEmitter;
    this.loadAccount();
  }

  private async loadAccount() {
    let privateKey = process.env.PRIVATE_KEY || '';
    if (ENCRYPTED_PRIVATE_KEY) {
      privateKey = await awsManager.decryptSecretName(ENCRYPTED_PRIVATE_KEY);
    }
    if (ENCRYPTED_DEFAULT_ADDRESS) {
      DEFAULT_ADDRESS = await awsManager.decryptSecretName(ENCRYPTED_DEFAULT_ADDRESS);
    }
    this.solo.loadAccount({
      address: DEFAULT_ADDRESS,
      privateKey
    });
  }

  private _createLimitOrder({
    makerAmount,
    takerAmount,
    makerMarket,
    takerMarket
  }: IDexOrder): LimitOrder {
    const order: LimitOrder = {
      makerMarket: new BigNumber(makerMarket),
      takerMarket: new BigNumber(takerMarket),
      makerAmount: new BigNumber(makerAmount),
      takerAmount: new BigNumber(takerAmount),
      makerAccountOwner: DEFAULT_ADDRESS,
      makerAccountNumber: new BigNumber(0),
      takerAccountOwner: TAKER_ACCOUNT_OWNER,
      takerAccountNumber: new BigNumber(0),
      expiration: new BigNumber(DEFAULT_EXPIRATION),
      salt: new BigNumber(Date.now())
    };

    return order;
  }

  private async _signOrder(order: LimitOrder): Promise<SignedLimitOrder> {
    return new Promise(async (resolve, reject) => {
      const typedSignature = await this.solo.limitOrders.signOrder(
        order,
        SigningMethod.Hash
      );

      const signedOrder: SignedLimitOrder = {
        ...order,
        typedSignature
      };

      if (!this.solo.limitOrders.orderHasValidSignature(signedOrder)) {
        reject(errorsConstants.INVALID_SIGNATURE);
      }
      resolve(signedOrder);
    });
  }

  public async placeOrder(cexOrder: ICexOrder, pair: string): Promise<IResponseOrder> {
    const dexOrder = convertToDexOrder(cexOrder, pair);
    const limitOrder = this._createLimitOrder(dexOrder);

    const signedOrder = await this._signOrder(limitOrder);
    const order = {
      ...signedOrder,
      fillOrKill: false
    };

    const { order: responseOrder } = await this.solo.api.placeOrder(order);
    const parsedOrder = this.parseApiOrder(responseOrder);
    if (this.redisManager) {
      this.redisManager.setOpenOrderInCache(parsedOrder);
    }

    if (this.observerEmitter) {
      this.observerEmitter.emit(observerEvents.placeOrder, parsedOrder);
    }

    return parsedOrder;
  }

  public async buy(price: number, amount: number, pair: string): Promise<IResponseOrder> {
    const cexOrder = { price, amount, side: MarketSide.buy };
    return this.placeOrder(cexOrder, pair);
  }

  public async sell(
    price: number,
    amount: number,
    pair: string
  ): Promise<IResponseOrder> {
    const cexOrder = { price, amount, side: MarketSide.sell };
    return this.placeOrder(cexOrder, pair);
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
    limit = 100,
    pairs
  }: {
    account?: string;
    limit?: number;
    pairs?: string[];
  }) {
    const { orders } = await this.solo.api.getOrders({
      limit,
      makerAccountOwner: account,
      pairs
    });

    return orders;
  }

  public async getOwnOrders(pair: string) {
    const [assetToken, baseToken] = getTokens(pair);

    const apiOrders = await this.getOrders({
      account: DEFAULT_ADDRESS,
      pairs: [
        `${assetToken.shortName}-${baseToken.shortName}`,
        `${baseToken.shortName}-${assetToken.shortName}`
      ]
    });
    const parsedOrders = apiOrders.map((apiOrder) => this.parseApiOrder(apiOrder));
    return parsedOrders;
  }

  public async getOrderById(orderId: string): Promise<IResponseOrder> {
    const { order } = await this.solo.api.getOrder({ id: orderId });
    const responseOrder = this.parseApiOrder(order);

    return responseOrder;
  }

  public async getOrderbook({ limit = 100 }, pair: string): Promise<IOrderbook> {
    const [assetToken, baseToken] = getTokens(pair);
    const marketName: string = `${assetToken.shortName}-${baseToken.shortName}`;

    const { bids, asks } = await this.solo.api.getOrderbookV2({
      market: ApiMarketName.WETH_DAI.includes(marketName)
        ? ApiMarketName.WETH_DAI
        : ApiMarketName.WETH_USDC
    });

    const parsedOrderbook = await Promise.all([
      asks.map((order: ApiOrderOnOrderbook) =>
        this.parseApiOrderbook(order, assetToken, baseToken)
      ),
      bids.map((order: ApiOrderOnOrderbook) =>
        this.parseApiOrderbook(order, assetToken, baseToken)
      )
    ]);

    const sellOrders = parsedOrderbook[0].slice(0, limit / 2);
    const buyOrders = parsedOrderbook[1].slice(0, limit / 2);
    return {
      sellOrders,
      buyOrders
    };
  }

  public async getMyFills(
    limit: number,
    pair: string,
    startingBefore: Date = new Date()
  ) {
    const [assetToken, baseToken] = getTokens(pair);
    const { fills } = await this.solo.api.getFills({
      makerAccountOwner: DEFAULT_ADDRESS,
      startingBefore,
      limit,
      pairs: [
        `${assetToken.shortName}-${baseToken.shortName}`,
        `${baseToken.shortName}-${assetToken.shortName}`
      ]
    });
    const fillsList: any = fills;
    const parsedFills = fillsList.map((fill: ApiFill) => {
      return this.parseApiFill(fill);
    });

    return parsedFills;
  }

  public async getAsk(pair: string) {
    const orderbook = await this.getOrderbook({ limit: 100 }, pair);
    const askPrice = orderbook.sellOrders[0].price;
    return askPrice;
  }

  public async getBid(pair: string) {
    const orderbook = await this.getOrderbook({ limit: 100 }, pair);
    const buyPrice = orderbook.buyOrders[0].price;
    return buyPrice;
  }

  public async cancelMyOrders(pair: string) {
    const orders = await this.getOwnOrders(pair);
    const ordersCanceled = Array<IResponseOrder>();
    await orders.forEach(async (order) => {
      ordersCanceled.push(await this.cancelOrder(order.id));
    });

    return orders;
  }

  /**
   * @deprecated Will be deleted future versions. This is a strategy module concern
   */
  public async postMany(amount: number, adjust: number = 1, side: string, pair: string) {
    const bidPrice = await this.getBid(pair);
    const prices = createPriceRange(bidPrice, adjust, side);

    if (side === 'buy') {
      return Promise.all(prices.map((price: number) => this.buy(price, amount, pair)));
    }

    return Promise.all(prices.map((price: number) => this.sell(price, amount, pair)));
  }

  private parseApiOrder(orderApi: ApiOrder): IResponseOrder {
    const {
      id,
      pair,
      createdAt,
      expiresAt,
      makerAmount,
      takerAmount,
      status,
      makerAmountRemaining,
      takerAmountRemaining,
      makerAccountOwner
    } = orderApi;

    const { price, amount, side } = convertToCexOrder({
      makerMarket: pair.makerCurrency.soloMarket,
      takerMarket: pair.takerCurrency.soloMarket,
      makerAmount,
      takerAmount
    });

    const { amount: amountRemaining } = convertToCexOrder({
      makerMarket: pair.makerCurrency.soloMarket,
      takerMarket: pair.takerCurrency.soloMarket,
      makerAmount: makerAmountRemaining,
      takerAmount: takerAmountRemaining
    });

    const responseOrder: IResponseOrder = {
      account: makerAccountOwner,
      id,
      pair: pair.name,
      side: MarketSideString[side],
      createdAt,
      expiresAt,
      price,
      amount,
      status,
      amountFilled: amount - amountRemaining,
      amountRemaining
    };

    return responseOrder;
  }

  private parseApiFill(fillApi: ApiFill): IResponseFill {
    const {
      orderId,
      transactionHash,
      order,
      createdAt,
      updatedAt,
      fillAmount,
      status
    } = fillApi;
    const {
      makerAmount,
      takerAmount,
      pair,
      makerAmountRemaining,
      takerAmountRemaining
    } = order;

    const { price, side, amount } = convertToCexOrder({
      makerMarket: pair.makerCurrency.soloMarket,
      takerMarket: pair.takerCurrency.soloMarket,
      makerAmount,
      takerAmount
    });

    const { amount: amountRemaining } = convertToCexOrder({
      makerMarket: pair.makerCurrency.soloMarket,
      takerMarket: pair.takerCurrency.soloMarket,
      makerAmount: makerAmountRemaining,
      takerAmount: takerAmountRemaining
    });

    const responseOrder: IResponseFill = {
      transactionHash,
      orderId,
      pair: pair.name,
      side: MarketSideString[side],
      createdAt,
      updatedAt,
      price,
      amount,
      fillStatus: status,
      orderStatus: order.status,
      amountFilled: amount - amountRemaining,
      amountRemaining
    };

    return responseOrder;
  }

  private parseApiOrderbook(
    apiOrderbook: ApiOrderOnOrderbook,
    assetToken: IToken,
    baseToken: IToken
  ): IParsedOrderbook {
    const { price, amount } = apiOrderbook;
    return {
      price: parseFloat(price) * Number(`1${baseToken.priceUnit}`),
      amount: convertFromWei(new BigNumber(amount), assetToken)
    };
  }
}

export default (solo: Solo, observerEmitter?: EventEmitter, redis?: IRedisManager) =>
  new OrdersManager(solo, observerEmitter, redis);
