import { SQS } from 'aws-sdk';
import app from '@server';
import { logger } from '@shared';
import config from './config';
// import RedisManager from './cache/redisManager';
import Observer from './observer';
import SQSConsumer from './sqs/SQSConsumer';
import SQSRoutes from './sqs/routes';
import SQSPublisher from './sqs/SQSPublisher';

// TODO: Traer "SENDER" y "PORT" desde "/config" mejor
const SENDER = process.env.SENDER_NAME || 'dydx-operator'

/* API SERVER */
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info('Express server started on port: ' + port);
});

/* REDIS */
// const redisManager = RedisManager(config.redis.host, config.redis.port);

/* SQS SERVER */
const sqs = new SQS({ region: config.sqs.region });
const sqsPublisher = new SQSPublisher(sqs, config.sqs.strategyQueueUrl, {
  sender: SENDER
});

/* OBSERVER */
const observer = new Observer(config.observer.interval, sqsPublisher);
observer.startInterval();

// sqsRoutes.loadRoutes
const sqsRoutes = SQSRoutes(sqsPublisher, observer.observerEmitter);

const sqsConsumer = SQSConsumer(sqs, config.sqs.consumerQueueUrl, sqsRoutes);
sqsConsumer.purge();
sqsConsumer.start();
