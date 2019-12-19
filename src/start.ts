import { SQS } from 'aws-sdk';
import app from '@server';
import { logger } from '@shared';
// import RedisManager from './cache/redisManager';
import Observer from './observer';
import SQSConsumer from './sqs/SQSConsumer';
import SQSRoutes from './sqs/routes';
import SQSPublisher from './sqs/SQSPublisher';
import config from '@config';

/* LOAD CONFIG */
const SENDER_NAME: string = config.sqs.senderName;
const PORT: number = config.server.port;
// const REDIS_HOST:string = config.redis.host;
// const REDIS_PORT:number = config.redis.port;
const REGION_SQS: string = config.aws.region.sqs;
const STRATEGY_QUEUE_URL: string = config.sqs.strategyQueueUrl;
const CONSUMER_QUEUE_URL: string = config.sqs.consumerQueueUrl;
const INTERVAL: number = config.observer.interval;

/* API SERVER */
app.listen(PORT, () => {
  logger.info('Express server started on port: ' + PORT);
});

/* REDIS */
// const redisManager = RedisManager(REDIS_HOST, REDIS_PORT);

/* SQS SERVER */
const sqs = new SQS({ region: REGION_SQS });
const sqsPublisher = new SQSPublisher(sqs, STRATEGY_QUEUE_URL, {
  sender: SENDER_NAME
});

/* OBSERVER */
const observer = new Observer(INTERVAL, sqsPublisher);
observer.startInterval();

// sqsRoutes.loadRoutes
const sqsRoutes = SQSRoutes(sqsPublisher, observer.observerEmitter);

const sqsConsumer = SQSConsumer(sqs, CONSUMER_QUEUE_URL, sqsRoutes);
sqsConsumer.purge();
sqsConsumer.start();
