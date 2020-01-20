import { IState, IResponseOrder, IFundsBalances, ICacheDB, IOperation } from '@entities';
import { EventEmitter } from 'events';
import { ORDER_STATUS_CANCELED, ORDER_STATUS_FILLED } from '../constants/OrderStatuses';

const CACHE_ORDERS_KEY = 'DYDX_ORDERS';
const CACHE_BALANCE_KEY = 'DYDX_BALANCE';

export default class StateManager {
  private _state: IState;
  private _stateChanges: EventEmitter;
  private _cacheDB: ICacheDB;
  public ready: Promise<any>;

  constructor(cacheDB: ICacheDB) {
    this._cacheDB = cacheDB;
    this._state = {
      orders: [],
      balances: {
        virtualWalletId: '',
        balances: [],
        oldestBalancesTimestamp: 0
      },
      operations: []
    };

    this.ready = new Promise((resolve, reject) => {
      this.initializeState()
        .then(resolve)
        .catch(reject);
    });

    this._stateChanges = new EventEmitter();
  }

  private async initializeState() {
    const ordersString = await this._cacheDB.getValueFromCache(CACHE_ORDERS_KEY);
    const balanceString = await this._cacheDB.getValueFromCache(CACHE_BALANCE_KEY);

    this._state.orders = ordersString ? JSON.parse(ordersString) : [];
    this._state.balances = balanceString ? JSON.parse(balanceString) : null;
  };

  public get state() {
    return this._state;
  }

  public async setOrderStatus(orderId: string, newStatus: string) {
    switch (newStatus) {
      case ORDER_STATUS_CANCELED:
        this.removeOrder(orderId);
        break;
      case ORDER_STATUS_FILLED:
        this.removeOrder(orderId);
        break;
      default:
        const orders = this.state.orders.map((order) => {
          if (order.id === orderId) {
            order.status = newStatus;
          }
          return order;
        });
        this.state.orders = orders;
        break;
    }

    this._stateChanges.emit('ORDER_STATUS_CHANGE', { orderId, orderStatus: newStatus });
    this._cacheDB.setValueInCache(CACHE_ORDERS_KEY, JSON.stringify(this.state.orders));
  }

  public setBalances(balances: IFundsBalances) {
    this._state.balances = balances;

    this._stateChanges.emit('BALANCE_CHANGE', balances);
    this._cacheDB.setValueInCache(CACHE_BALANCE_KEY, JSON.stringify(balances));
  }

  public async setNewOrder(order: IResponseOrder) {
    this._state.orders.push(order);
    this._stateChanges.emit('NEW_ORDER', order);
    this._cacheDB.setValueInCache(CACHE_ORDERS_KEY, JSON.stringify(this.state.orders));
  }

  public setNewOperation(operation: IOperation) {
    this._state.operations.push(operation);
    this._stateChanges.emit('NEW_OPERATION', operation);
  }

  public get stateChanges() {
    return this._stateChanges;
  }

  private removeOrder(orderId: string) {
    const orderIndex = this._state.orders.findIndex((order) => order.id === orderId);
    this._state.orders.splice(orderIndex, 1);
    this._cacheDB.setValueInCache(CACHE_ORDERS_KEY, JSON.stringify(this.state.orders));
  }
}
