import { ISQSRoute } from '@entities';
import SQSPublisher from '../SQSPublisher';
import Orders from './Orders';
import Balance from './Balance';
import { StateManager } from '../../services/StateManager';

export default (sqsPublisher: SQSPublisher, stateManager: StateManager) => {
  const ordersRoutes = Orders(sqsPublisher, stateManager).routes;
  const balanceRoutes = Balance(sqsPublisher, stateManager.state).routes;

  const sqsRoutes: ISQSRoute[] = [...ordersRoutes, ...balanceRoutes];
  return sqsRoutes;
};
