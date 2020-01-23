import { pair, logLevel, snsDebugLogLevel } from './types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // APP
      NODE_ENV: 'production' | 'development' | 'test';
      LOG_LEVEL: logLevel;
      API_KEY: string;

      // Server
      PORT: string;
      HTTP_PROVIDER: string;

      // Account
      PRIVATE_KEY: string;
      DEFAULT_ADDRESS: string;

      // Secret Manager
      SM_TAG_KEY: string;
      SM_TAG_ADDRESS: string;

      // dydx
      TAKER_ACCOUNT: string;
      EXPIRATION_IN_SECONDS: string;
      DEFAULT_PAIR: pair;

      // AWS
      ACCESS_KEY_ID: string;
      SECRET_ACCESS_KEY: string;
      KMS_REGION: string;
      SNS_REGION: string;
      SQS_REGION: string;
      SM_REGION: string;

      // Redis
      REDIS_HOST: string;
      REDIS_PORT: string;

      // Observer
      FUND_MONITOR_INTERVAL: string;
      ORDER_MONITOR_INTERVAL: string;
      MAX_QTY_ETH: string;

      // SQS
      SENDER_NAME: string;
      RECEIVER_NAME: string;
      STRATEGY_QUEUE_URL: string;
      TRADEOPS_QUEUE_URL: string;
      MSJ_GROUP_ID: string;
      CONSUMER_BATCH_SIZE: string;
      LOGS_TOPIC_ARN: string;
      // SNS
      SNS_DEBUG_LOG_LEVEL: snsDebugLogLevel;
    }
  }
}

export default global;

// TODO: Buscar la manera de colocar type "number" a los process.env
