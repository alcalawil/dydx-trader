import { ISQSRoute } from '@entities';
import Orders from './Orders';
import SQSPublisher from 'src/sqs/SQSPublisher';


export default (sqsPublisher: SQSPublisher) => {
  const ordersRoutes = Orders(sqsPublisher).routes;

  const sqsRoutes: ISQSRoute[] = [...ordersRoutes];
  return sqsRoutes
};
