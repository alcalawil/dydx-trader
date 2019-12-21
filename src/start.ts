import { SQS } from 'aws-sdk';
import app from '@server';
import { logger } from '@shared';
// import RedisManager from './cache/redisManager';
import SQSConsumer from './sqs/SQSConsumer';
import SQSRoutes from './sqs/routes';
import SQSPublisher from './sqs/SQSPublisher';
import config from '@config';
import {
  getSoloInstance,
  operationsService,
  awsManager,
  gettersService,
  Observer
} from '@services';
import StateManager from './services/StateManager';
import { IOrderStatus, IBalances } from '@entities';
import { ORDERS_STATUS_CHANGES, BALANCES_CHANGES } from '@topics';

/* LOAD CONFIG */
const SENDER_NAME: string = config.sqs.senderName;
const PORT: number = config.server.port;
// const REDIS_HOST:string = config.redis.host;
// const REDIS_PORT:number = config.redis.port;
const REGION_SQS: string = config.aws.region.sqs;
const STRATEGY_QUEUE_URL: string = config.sqs.strategyQueueUrl;
const CONSUMER_QUEUE_URL: string = config.sqs.consumerQueueUrl;
const INTERVAL: number = config.observer.interval;

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
  // Load keys from Secret Manager
  const address = await awsManager.decryptSecretName(config.secretManager.tagAddress);
  const privateKey = await awsManager.decryptSecretName(config.secretManager.tagKey);
  // Initialize state
  const stateManager = new StateManager();

  // Load SOLO
  const solo = getSoloInstance();
  solo.loadAccount({
    address,
    privateKey
  });
  // Update config
  config.account.defaultAddress = address;
  // Initialize Services
  operationsService.setDefaultAccount(address);
  gettersService.setDefaultAccount(address);
  operationsService.setDependencies(solo, stateManager);
  gettersService.setDependencies(solo);

  /* Config SQS SERVER */
  const sqs = new SQS({ region: REGION_SQS });
  const sqsPublisher = new SQSPublisher(sqs, STRATEGY_QUEUE_URL, {
    sender: SENDER_NAME
  });
  const sqsRoutes = SQSRoutes(sqsPublisher);
  const sqsConsumer = SQSConsumer(sqs, CONSUMER_QUEUE_URL, sqsRoutes);

  // Start API server
  app.listen(PORT, () => {
    logger.info('Express server started on port: ' + PORT);
  });

  // Start SQS Server
  await sqsConsumer.purge();
  sqsConsumer.start();

  const observer = Observer(stateManager);
  observer.startInterval();

  // Esto no sé si deba ir acá o capaz en un service
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

  // Uncomment if want to send balances changes
  // stateManager.stateChanges.on('BALANCE_CHANGE', (balances: IBalances) => {
  //   sqsPublisher.publishToSQS(BALANCES_CHANGES, JSON.stringify(balances));
  //   logger.debug('SQS BALANCE_CHANGE SEND');
  // });
})();
