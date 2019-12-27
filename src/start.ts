import { SQS, SNS } from 'aws-sdk';
import app from '@server';
import { logger } from '@shared';
// import RedisManager from './cache/redisManager';
import SQSConsumer from './sqs/SQSConsumer';
import SQSRoutes from './sqs/routes';
import SQSPublisher from './sqs/SQSPublisher';
import SNSLogger from './sns/SNSLogger';
import config from '@config';
import {
  getSoloInstance,
  operationsService,
  awsManager,
  gettersService,
  Observer,
  StateManager
} from '@services';
import { IOrderStatus, logLevel } from '@entities';
import { ORDERS_STATUS_CHANGES } from '@topics';
import { GET_ADDRESS, GET_PRIVATE_KEY } from './constants/logTypes';

/* LOAD CONFIG */
const SENDER_NAME: string = config.sqs.senderName;
const PORT: number = config.server.port;
// const REDIS_HOST:string = config.redis.host;
// const REDIS_PORT:number = config.redis.port;
const REGION_SQS: string = config.aws.region.sqs;
const REGION_SNS: string = config.aws.region.sns;
const STRATEGY_QUEUE_URL: string = config.sqs.strategyQueueUrl;
const TRADEOPS_QUEUE_URL: string = config.sqs.tradeOpsQueueUrl;
const LOGS_TOPIC_ARN: string = config.sqs.logTopicArn;
const SECURITY_LOG_LEVEL: logLevel = 'security';

// --------------- 3. Inicializar AWS / SOLO / REDIS / etc -----------------------

/*
  TODO:
    - Use try catch where needed
    - Create a loaders folder to make this script simpler
    - Refactor Redis - Create an abstract db driver
    - Inject db driver into stateManager
    - Add catch unhanded exception
*/

(async () => {
  // Config SNS LOGGER
  const sns = new SNS({ region: REGION_SNS });
  const snsLogger = new SNSLogger(sns, LOGS_TOPIC_ARN);

  // Load keys from Secret Manager
  const address = await awsManager.decryptSecretName(config.secretManager.tagAddress);
  snsLogger.LogMessage(
    `Consultando secret name a secret manager.`,
    {
      details: {
        secretName: config.secretManager.tagAddress
      }
    },
    GET_ADDRESS,
    SECURITY_LOG_LEVEL,
    '2'
  );
  const privateKey = await awsManager.decryptSecretName(config.secretManager.tagKey);
  snsLogger.LogMessage(
    `Consultando secret name a secret manager.`,
    {
      details: {
        secretName: config.secretManager.tagKey
      }
    },
    GET_PRIVATE_KEY,
    SECURITY_LOG_LEVEL,
    '2'
  );

  // const address = config.account.defaultAddress;
  // const privateKey = config.account.privateKey;

  // Initialize state
  const stateManager = new StateManager();

  // Init SOLO
  const solo = getSoloInstance();
  solo.loadAccount({
    address,
    privateKey
  });

  // Init Services
  operationsService.setDefaultAccount(address);
  gettersService.setDefaultAccount(address);
  operationsService.setDependencies(solo, stateManager, snsLogger);
  gettersService.setDependencies(solo);

  // Config SQS Server
  const sqs = new SQS({ region: REGION_SQS });
  const sqsPublisher = new SQSPublisher(sqs, STRATEGY_QUEUE_URL, {
    sender: SENDER_NAME
  });
  const sqsRoutes = SQSRoutes(sqsPublisher, snsLogger, stateManager);
  const sqsConsumer = SQSConsumer(sqs, TRADEOPS_QUEUE_URL, sqsRoutes, snsLogger);

  // Start API Server
  app.listen(PORT, () => {
    logger.info('Express server started on port: ' + PORT);
  });

  // Start SQS Server
  await sqsConsumer.purge();
  sqsConsumer.start();

  const observer = Observer(stateManager, snsLogger);
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
