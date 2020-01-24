import { IResponseParams, OperStates, IOper } from '@entities';
import Response from '../Response';

export default class OperationsResponse extends Response {
  private state: OperStates;
  private Operations: IOper;

  constructor(resParams: IResponseParams, state: OperStates, Operations: IOper) {
    super(resParams);
    this.state = state;
    this.Operations = Operations
  }
}
