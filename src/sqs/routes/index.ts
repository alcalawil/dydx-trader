import { ISQSRoute, ILogger } from '@entities';
import SQSPublisher from '../SQSPublisher';
import Orders from './Orders';
import Balance from './Balance';
import { StateManager } from '../../services/StateManager';

export default (
  sqsPublisher: SQSPublisher,
  logger: ILogger,
  stateManager: StateManager
) => {
  const ordersRoutes = Orders(sqsPublisher, logger, stateManager).routes;
  const balanceRoutes = Balance(sqsPublisher, logger, stateManager.state).routes;

  const sqsRoutes: ISQSRoute[] = [...ordersRoutes, ...balanceRoutes];
  return sqsRoutes;
};
