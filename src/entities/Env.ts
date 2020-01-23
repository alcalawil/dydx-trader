import { pair, logLevel, snsDebugLogLevel, env } from './types';

export interface IProcessEnv {
  // APP
  NODE_ENV: env;
  LOG_LEVEL: logLevel;
  API_KEY: string;

  // Server
  PORT: number;
  HTTP_PROVIDER: string;

  // Account
  PRIVATE_KEY: string;
  DEFAULT_ADDRESS: string;

  // Secret Manager
  SM_TAG_KEY: string;
  SM_TAG_ADDRESS: string;

  // dydx
  TAKER_ACCOUNT: string;
  EXPIRATION_IN_SECONDS: number;
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
  REDIS_PORT: number;

  // Intervals
  FUND_MONITOR_INTERVAL: number;
  ORDER_MONITOR_INTERVAL: number;

  // SQS
  SENDER_NAME: string;
  RECEIVER_NAME: string;
  STRATEGY_QUEUE_URL: string;
  TRADEOPS_QUEUE_URL: string;
  LOGS_TOPIC_ARN: string;
  MSJ_GROUP_ID: string;
  CONSUMER_BATCH_SIZE: number;
  SNS_DEBUG_LOG_LEVEL: snsDebugLogLevel;
}
