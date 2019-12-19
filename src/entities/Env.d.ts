import { pair } from './types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // APP
      NODE_ENV: 'production' | 'development' | 'test';
      LOG_LEVEL: string
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
      OBSERVER_INTERVAL: string;
      MAX_QTY_ETH: string;

      // SQS
      SENDER_NAME: string
      RECEIVER_NAME: string
      STRATEGY_QUEUE_URL: string;
      CONSUMER_QUEUE_URL: string;
      TRANSACTIONAL_LOGS_QUEUE_ARN: string;
    }
  }
}

export default global;

// TODO: Buscar la manera de colocar type "number" a los process.env
