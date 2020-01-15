import { ISQSRoute, IState } from '@entities';
import SQSPublisher from '../SQSPublisher';
import Orders from './Orders';
import Balance from './Balance';

export default (sqsPublisher: SQSPublisher, state: IState) => {
  const ordersRoutes = Orders(sqsPublisher).routes;
  const balanceRoutes = Balance(sqsPublisher, state).routes;

  const sqsRoutes: ISQSRoute[] = [...ordersRoutes, ...balanceRoutes];
  return sqsRoutes;
};
