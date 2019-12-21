import { IState, IResponseOrder, IBalances } from '@entities';
import { EventEmitter } from 'events';

export default class StateManager {
  private _state: IState;
  private _stateChanges: EventEmitter;

  constructor() {
    // TODO: Receive db driver though constructor
    // TODO: Load state from Redis
    this._state = {
      orders: [],
      balances: null
    };
    this._stateChanges = new EventEmitter();
  }

  public get state() {
    return this._state;
  }

  public setOrderStatus(orderId: string, newStatus: string) {
    const orders = this.state.orders.map((order) => {
      if (order.id === orderId) {
        order.status = newStatus;
      }
      return order;
    });
    // Acá se puede por agregar lógica sobre el manejo del estado de la orden.
    // Por ejemplo, si el status == FILLED eliminar la orden de la lista

    this.state.orders = orders;

    const data = {
      orderId,
      newStatus
    };
    this._stateChanges.emit('ORDER_STATUS_CHANGE', { orderId, orderStatus: newStatus });
  }

  public setBalances(balances: IBalances) {
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

  // TODO: Add removeOrder() {}
}
