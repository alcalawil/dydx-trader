import app from '@server';
import { logger } from '@shared';
import config from './config';
import SQSConsumer from './modules/SQSConsumer';
import sqsRoutes from './sqsRoutes';
import RedisManager from './cache/redisManager';
import Observer from './observer';

// Initialize Server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info('Express server started on port: ' + port);
});

// SQS
const sqsConsumer = SQSConsumer(config, sqsRoutes);
sqsConsumer.start();

// Redis
const redisManager = RedisManager(config.redis.host, config.redis.port);

// Observer
const observer = new Observer(config.observer.interval, redisManager);
observer.startInterval();
