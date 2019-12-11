import { ISQSRoute, IRedisManager } from '@entities';
import Orders from './Orders';
import SQSPublisher from '../SQSPublisher';


export default (sqsPublisher: SQSPublisher, redisManager?: IRedisManager) => {
  const ordersRoutes = Orders(sqsPublisher, redisManager).routes;

  const sqsRoutes: ISQSRoute[] = [...ordersRoutes];
  return sqsRoutes
};
