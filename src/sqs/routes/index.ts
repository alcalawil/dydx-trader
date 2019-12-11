import { ISQSRoute, IRedisManager } from '@entities';
import Orders from './Orders';
import SQSPublisher from '../SQSPublisher';
import { EventEmitter } from 'events';

export default (
  sqsPublisher: SQSPublisher,
  observerEmitter: EventEmitter,
  redisManager?: IRedisManager
) => {
  const ordersRoutes = Orders(sqsPublisher, observerEmitter, redisManager).routes;

  const sqsRoutes: ISQSRoute[] = [...ordersRoutes];
  return sqsRoutes;
};
