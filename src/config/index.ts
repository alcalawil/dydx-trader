import { IConfig } from '@entities';
// import { isNumber } from 'util';

const ENV: NodeJS.ProcessEnv = process.env;
const DEFAULT_REGION = 'us-east-1';

/* APP */
const NODE_ENV: string = ENV.NODE_ENV || '';
const LOG_LEVEL: string = ENV.LOG_LEVEL || '';
const API_KEY: string = ENV.API_KEY || '12345';

/* SERVER */
const PORT: number = Number(ENV.PORT) || 3000;
const HTTP_PROVIDER: string = ENV.HTTP_PROVIDER || '';

/* ACCOUNT */
const DEFAULT_ADDRESS: string = ENV.DEFAULT_ADDRESS || '';
const PRIVATE_KEY: string = ENV.PRIVATE_KEY || '';
const ENCRYPTED_DEFAULT_ADDRESS: string = ENV.ENCRYPTED_DEFAULT_ADDRESS || '';
const ENCRYPTED_PRIVATE_KEY: string = ENV.ENCRYPTED_PRIVATE_KEY || '';

/* DYDX */
const TAKER_ACCOUNT: string = ENV.TAKER_ACCOUNT || '';
const EXPIRATION_IN_SECONDS: number = Number(ENV.EXPIRATION_IN_SECONDS) || 1250;

/* AWS */
const ACCESS_KEY_ID: string = ENV.ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY: string = ENV.SECRET_ACCESS_KEY || '';
const KMS_REGION: string = ENV.KMS_REGION || DEFAULT_REGION;
const SNS_REGION: string = ENV.SNS_REGION || DEFAULT_REGION;
const SM_REGION: string = ENV.SM_REGION || DEFAULT_REGION;

/* REDIS */
const REDIS_HOST: string = ENV.HOST || '';
const REDIS_PORT: number = Number(ENV.PORT) || 6379;

/* OBSERVER */
const OBSERVER_INTERVAL: number = Number(ENV.OBSERVER_INTERVAL) || 1;
const MAX_QTY_ETH: number = Number(ENV.MAX_QTY_ETH) || 0.3;

/* SQS */
const SENDER_NAME: string = ENV.SENDER_NAME || 'bot_operator';
const RECEIVER_NAME: string = ENV.RECEIVER_NAME || 'strategy';
const STRATEGY_QUEUE_URL: string = ENV.STRATEGY_QUEUE_URL || '';
const CONSUMER_QUEUE_URL: string =
  ENV.CONSUMER_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/949045345033/test.fifo';
const TRANSACTIONAL_LOGS_QUEUE_ARN: string =
  ENV.TRANSACTIONAL_LOGS_QUEUE_ARN || 'arn:aws:sns:us-east-1:949045345033:test';
const SQS_REGION: string = ENV.SQS_REGION || DEFAULT_REGION;

// TODO: Solo una idea
/* FILTER */
// validar todos los env que sean numeros por aqui y luego hacer la conversion con "Number"
// if (isNumber(ENV) === false) throw new Error('ENV ERROR: ENV enviroment no is number');
/*------*/

const config: IConfig = {
  app: {
    nodeEnv: NODE_ENV,
    logLevel: LOG_LEVEL,
    apiKey: API_KEY
  },
  server: {
    port: PORT,
    httpProvider: HTTP_PROVIDER
  },
  account: {
    normal: {
      defaultAddress: DEFAULT_ADDRESS,
      privateKey: PRIVATE_KEY
    },
    encrypted: {
      defaultAddress: ENCRYPTED_DEFAULT_ADDRESS,
      privateKey: ENCRYPTED_PRIVATE_KEY
    }
  },
  dydx: {
    takerAccount: TAKER_ACCOUNT,
    expirationInSeconds: EXPIRATION_IN_SECONDS
  },
  aws: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: {
      kms: KMS_REGION,
      sns: SNS_REGION,
      sm: SM_REGION
    }
  },
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT
  },
  observer: {
    interval: OBSERVER_INTERVAL,
    maxQtyEth: MAX_QTY_ETH
  },
  sqs: {
    senderName: SENDER_NAME,
    receiverName: RECEIVER_NAME,
    strategyQueueUrl: STRATEGY_QUEUE_URL,
    consumerQueueUrl: CONSUMER_QUEUE_URL,
    transactionalLog: TRANSACTIONAL_LOGS_QUEUE_ARN,
    region: SQS_REGION
  }
};

export default config;

// TODO:
// 1. Validate that ENV variables are loaded before being used
// 2. Establecer valores por defecto en todas las constantes, no sirve un simpre "vacio"
