import { SQS, SNS } from 'aws-sdk';
import app from '@server';
import { logger } from '@shared';
import SQSConsumer from './sqs/SQSConsumer';
import SQSRoutes from './sqs/routes';
import SQSPublisher from './sqs/SQSPublisher';
import SNSLogger from './loggers/SNSLogger';
import config from '@config';
import {
  getSoloInstance,
  operationsService,
  awsManager,
  gettersService,
  Observer,
  StateManager
} from '@services';
import { IOrderStatus } from '@entities';
import { ORDERS_STATUS_CHANGES } from '@topics';
import RedisDriver from './db/cache/redisDriver';
import Logger from './loggers/Logger';

/* LOAD CONFIG */
const SENDER_NAME: string = config.sqs.senderName;
const PORT: number = config.server.port;
const REGION_SQS: string = config.aws.region.sqs;
const REGION_SNS: string = config.aws.region.sns;
const STRATEGY_QUEUE_URL: string = config.sqs.strategyQueueUrl;
const TRADEOPS_QUEUE_URL: string = config.sqs.tradeOpsQueueUrl;
const LOGS_TOPIC_ARN: string = config.sqs.logTopicArn;

// --------------- 3. Inicializar AWS / SOLO / REDIS / etc -----------------------

/*
  TODO:
    - Use try catch where needed
    - Create a loaders folder to make this script simpler
    - Add catch unhanded exception
*/

(async () => {
  // Config Loggers
  const sns = new SNS({ region: REGION_SNS });
  const snsLogger = new SNSLogger(sns, LOGS_TOPIC_ARN);
  Logger.add(snsLogger);

  // Load keys from Secret Manager
  const address = await awsManager.decryptSecretName(config.secretManager.tagAddress);
  const privateKey = await awsManager.decryptSecretName(config.secretManager.tagKey);

  // Initialize state
  const cacheDB = RedisDriver(config.redis);
  const stateManager = new StateManager(cacheDB);
  await stateManager.ready;

  // Init SOLO
  const solo = getSoloInstance();
  solo.loadAccount({
    address,
    privateKey
  });

  // Init Services
  operationsService.setDefaultAccount(address);
  gettersService.setDefaultAccount(address);
  operationsService.setDependencies(solo, stateManager);
  gettersService.setDependencies(solo);

  // Config SQS Server
  const sqs = new SQS({ region: REGION_SQS });
  const sqsPublisher = new SQSPublisher(sqs, STRATEGY_QUEUE_URL, {
    sender: SENDER_NAME
  });
  const sqsRoutes = SQSRoutes(sqsPublisher, stateManager);
  const sqsConsumer = SQSConsumer(sqs, TRADEOPS_QUEUE_URL, sqsRoutes);

  // Start API Server
  app.listen(PORT, () => {
    logger.info('Express server started on port: ' + PORT);
  });

  // Start SQS Server
  await sqsConsumer.purge();
  sqsConsumer.start();

  const observer = Observer(stateManager);
  observer.startInterval();

  // TODO: Esto no sé si deba ir acá o capaz en un service
  stateManager.stateChanges.on(
    'ORDER_STATUS_CHANGE',
    ({ orderId, orderStatus }: IOrderStatus) => {
      sqsPublisher.publishToSQS(
        ORDERS_STATUS_CHANGES,
        JSON.stringify({ orderId, orderStatus })
      );
      logger.debug('SQS ORDER_STATUS_CHANGE SEND');
    }
  );
})();
