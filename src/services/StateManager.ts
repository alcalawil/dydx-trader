import { IState, IResponseOrder, IFundsBalances } from '@entities';
import { EventEmitter } from 'events';
import { ORDER_STATUS_CANCELED, ORDER_STATUS_FILLED } from '../constants/OrderStatuses';

export class StateManager {
  private _state: IState;
  private _stateChanges: EventEmitter;

  constructor() {
    // TODO: Receive db driver though constructor
    // TODO: Load state from Redis
    this._state = {
      orders: [],
      balances: {
        virtualWalletId: '',
        balances: [],
        oldestBalancesTimestamp: 0
      }
    };
    this._stateChanges = new EventEmitter();
  }

  public get state() {
    return this._state;
  }

  public setOrderStatus(orderId: string, newStatus: string) {
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
  }

  public setBalances(balances: IFundsBalances) {
    this._state.balances = balances;
    this._stateChanges.emit('BALANCE_CHANGE', balances);
  }

  public setNewOrder(order: IResponseOrder) {
    this._state.orders.push(order);
    this._stateChanges.emit('NEW_ORDER', order);
  }

  public get stateChanges() {
    return this._stateChanges;
  }

  private removeOrder(orderId: string) {
    const orderIndex = this._state.orders.findIndex((order) => order.id === orderId);
    this._state.orders.splice(orderIndex, 1);
  }
}
