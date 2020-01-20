import { ISQSRoute, IState } from '@entities';
import SQSPublisher from '../SQSPublisher';
import Orders from './Orders';
import Balance from './Balance';
import SNSLogger from '../../sns/SNSLogger';
import { StateManager } from '../../services/StateManager';

export default (
  sqsPublisher: SQSPublisher,
  snsLogger: SNSLogger,
  stateManager: StateManager
) => {
  const ordersRoutes = Orders(sqsPublisher, snsLogger, stateManager).routes;
  const balanceRoutes = Balance(sqsPublisher, snsLogger, stateManager.state).routes;

  const sqsRoutes: ISQSRoute[] = [...ordersRoutes, ...balanceRoutes];
  return sqsRoutes;
};
