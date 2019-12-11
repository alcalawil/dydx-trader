import app from '@server';
import { logger } from '@shared';
import { SQS } from 'aws-sdk';
import config from './config';
import SQSConsumer from './modules/SQSConsumer';
import SQSRoutes from './sqs/routes';
import RedisManager from './cache/redisManager';
import Observer from './observer';
import SQSPublisher from './sqs/SQSPublisher';

// Initialize API Server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info('Express server started on port: ' + port);
});

// Redis
// const redisManager = RedisManager(config.redis.host, config.redis.port);

// Initialize SQS Server
const sqs = new SQS({ region: config.sqs.region });
const sqsPublisher = new SQSPublisher(sqs, config.sqs.strategyQueueUrl, {
  sender: 'dydx-operator'
});
// sqsRoutes.loadRoutes
const sqsRoutes = SQSRoutes(sqsPublisher);
// const sqsRoutes = SQSRoutes(sqsPublisher, redisManager);

const sqsConsumer = SQSConsumer(sqs, config.sqs.consumerQueueUrl, sqsRoutes);
sqsConsumer.start();

// Observer
// const observer = new Observer(config.observer.interval, redisManager, sqsPublisher);
// observer.startInterval();
