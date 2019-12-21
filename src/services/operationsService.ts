import { MarketSide, IResponseOrder, ICexOrder, IDexOrder } from '@entities';
import {
  Solo,
  LimitOrder,
  BigNumber,
  SignedLimitOrder,
  SigningMethod
} from '@dydxprotocol/solo';
import { convertToDexOrder, convertToResponseOrder } from '../helpers/converters';
import { gettersService } from './gettersService';
import config from '@config';
import StateManager from './StateManager';

// Config
let DEFAULT_ADDRESS = config.account.defaultAddress;
const DEFAULT_EXPIRATION = config.dydx.expirationInSeconds;
const TAKER_ACCOUNT_OWNER = config.dydx.takerAccount;

// Dependencies
let _solo: Solo;
let _stateManager: StateManager;

class OperationsService {
  public setDefaultAccount(account: string) {
    DEFAULT_ADDRESS = account;
  }

  public setDependencies(solo: Solo, stateManager: StateManager) {
    _solo = solo;
    _stateManager = stateManager;
  }

  public async placeOrder(cexOrder: ICexOrder, pair: string): Promise<IResponseOrder> {
    const dexOrder = convertToDexOrder(cexOrder, pair);
    const limitOrder = this._createLimitOrder(dexOrder);

    const signedOrder = await this._signOrder(limitOrder);
    const order = {
      ...signedOrder,
      fillOrKill: false
    };

    const { order: apiOrder } = await _solo.api.placeOrder(order);
    const responseOrder = convertToResponseOrder(apiOrder);
    _stateManager.setNewOrder(responseOrder);
  
    return responseOrder;
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
    const { order } = await _solo.api.cancelOrder({
      orderId,
      makerAccountOwner: DEFAULT_ADDRESS
    });

    const parsedOrder = convertToResponseOrder(order);
    // TODO: _stateManager.removeOrder
    return parsedOrder;
  }

  public async cancelMyOrders(pair: string) {
    const orders = await gettersService.getMyOrders(pair);
    const ordersCanceled = Array<IResponseOrder>();
    await orders.forEach(async (order) => {
      ordersCanceled.push(await this.cancelOrder(order.id));
    });

    return orders;
  }

  private async _signOrder(order: LimitOrder): Promise<SignedLimitOrder> {
    const typedSignature = await _solo.limitOrders.signOrder(
      order,
      SigningMethod.Hash
    );

    const signedOrder: SignedLimitOrder = {
      ...order,
      typedSignature
    };

    if (!_solo.limitOrders.orderHasValidSignature(signedOrder)) {
      throw new Error('Invalid signature');
    }

    return signedOrder;
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
}

export const operationsService =  new OperationsService();
