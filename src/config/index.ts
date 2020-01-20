import { IConfig, pair, snsDebugLogLevel, logLevel } from '@entities';
// import { isNumber } from 'util';

const ENV: NodeJS.ProcessEnv = process.env;
const DEFAULT_REGION: string = 'us-east-1';
const DEFAULT_LOG_LEVEL: logLevel = 'debug';
const DEFAULT_SNS_DEBUG_LEVEL: snsDebugLogLevel = '5';

/* APP */
const NODE_ENV: string = ENV.NODE_ENV || 'development';
const LOG_LEVEL: logLevel = (ENV.LOG_LEVEL as logLevel) || DEFAULT_LOG_LEVEL;
const API_KEY: string = ENV.API_KEY || '12345';
const VERSION: string = process.env.npm_package_version || '';

/* SERVER */
const PORT: number = Number(ENV.PORT) || 3000;
const HTTP_PROVIDER: string = ENV.HTTP_PROVIDER || '';

/* ACCOUNT */
const DEFAULT_ADDRESS: string = ENV.DEFAULT_ADDRESS || '';
const PRIVATE_KEY: string = ENV.PRIVATE_KEY || '';

/* SECRET MANAGER */
const SM_TAG_KEY: string = ENV.SM_TAG_KEY || 'TEST_WALLET_1_PRIVATE_KEY';
const SM_TAG_ADDRESS: string = ENV.SM_TAG_ADDRESS || 'TEST_WALLET_1_PUBLIC_KEY';

/* DYDX */
const TAKER_ACCOUNT: string =
  ENV.TAKER_ACCOUNT || '0x0000000000000000000000000000000000000000';
const EXPIRATION_IN_SECONDS: number = Number(ENV.EXPIRATION_IN_SECONDS) || 1250;
const DEFAULT_PAIR: pair = (ENV.DEFAULT_PAIR as pair) || 'WETH-DAI';

/* AWS */
const ACCESS_KEY_ID: string = ENV.ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY: string = ENV.SECRET_ACCESS_KEY || '';
const KMS_REGION: string = ENV.KMS_REGION || DEFAULT_REGION;
const SNS_REGION: string = ENV.SNS_REGION || DEFAULT_REGION;
const SM_REGION: string = ENV.SM_REGION || DEFAULT_REGION;
const SQS_REGION: string = ENV.SQS_REGION || DEFAULT_REGION;

/* REDIS */
const REDIS_HOST: string = ENV.HOST || '';
const REDIS_PORT: number = Number(ENV.REDIS_PORT) || 6379;

/* OBSERVER */
const FUND_MONITOR_INTERVAL: number = Number(ENV.FUND_MONITOR_INTERVAL) || 120;
const ORDER_MONITOR_INTERVAL: number = Number(ENV.ORDER_MONITOR_INTERVAL) || 15;
const MAX_QTY_ETH: number = Number(ENV.MAX_QTY_ETH) || 0.3;

/* SQS */
const SENDER_NAME: string = ENV.SENDER_NAME || 'bot_operator';
const RECEIVER_NAME: string = ENV.RECEIVER_NAME || 'strategy';
const STRATEGY_QUEUE_URL: string = ENV.STRATEGY_QUEUE_URL || '';
const TRADEOPS_QUEUE_URL: string = ENV.TRADEOPS_QUEUE_URL || '';
const TRANSACTIONAL_LOGS_QUEUE_ARN: string = ENV.TRANSACTIONAL_LOGS_QUEUE_ARN || '';
const MSJ_GROUP_ID: string = ENV.MSJ_GROUP_ID || 'DEFAULT_GROUP_ID';
const CONSUMER_BATCH_SIZE: number = Number(ENV.CONSUMER_BATCH_SIZE) || 10;
const LOGS_TOPIC_ARN: string =
  ENV.LOGS_TOPIC_ARN || 'arn:aws:sns:us-east-1:949045345033:test';
const SNS_DEBUG_LOG_LEVEL: snsDebugLogLevel =
  (ENV.SNS_DEBUG_LOG_LEVEL as snsDebugLogLevel) || DEFAULT_SNS_DEBUG_LEVEL;

/****************************************************************************************/

const config: IConfig = {
  app: {
    nodeEnv: NODE_ENV,
    logLevel: LOG_LEVEL,
    apiKey: API_KEY,
    version: VERSION
  },
  server: {
    port: PORT,
    httpProvider: HTTP_PROVIDER
  },
  account: {
    defaultAddress: DEFAULT_ADDRESS,
    privateKey: PRIVATE_KEY
  },
  secretManager: {
    tagKey: SM_TAG_KEY,
    tagAddress: SM_TAG_ADDRESS
  },
  dydx: {
    takerAccount: TAKER_ACCOUNT,
    expirationInSeconds: EXPIRATION_IN_SECONDS,
    defaultPair: DEFAULT_PAIR
  },
  aws: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: {
      kms: KMS_REGION,
      sns: SNS_REGION,
      sqs: SQS_REGION,
      sm: SM_REGION
    }
  },
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT
  },
  observer: {
    interval: {
      fundMonitor: FUND_MONITOR_INTERVAL,
      orderMonitor: ORDER_MONITOR_INTERVAL
    },
    maxQtyEth: MAX_QTY_ETH
  },
  sqs: {
    senderName: SENDER_NAME,
    receiverName: RECEIVER_NAME,
    strategyQueueUrl: STRATEGY_QUEUE_URL,
    tradeOpsQueueUrl: TRADEOPS_QUEUE_URL,
    logTopicArn: LOGS_TOPIC_ARN,
    msjGroupId: MSJ_GROUP_ID,
    consumerBatchSize: CONSUMER_BATCH_SIZE,
    logLevel: SNS_DEBUG_LOG_LEVEL
  }
};

export default config;

// TODO: Buscar valores por defecto para todos los env

// TODO: Cargador de variables super-globales como en php
// function loadEnvGlobal() {
//   global.nodeEnv = NODE_ENV;
// }

// TODO: Validar las variables que sean numericas antes de hacer la conversion con "Number"
// preferiblemente haciendo uso de types
