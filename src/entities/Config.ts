import { pair, logLevel, snsDebugLogLevel, env } from './types';

export interface IConfig {
  app: {
    nodeEnv: env;
    logLevel: logLevel;
    apiKey: string;
    version: string;
    ip: string;
  };
  server: {
    port: number;
    httpProvider: string;
  };
  account: {
    privateKey: string;
    defaultAddress: string;
  };
  secretManager: {
    tagKey: string;
    tagAddress: string;
  };
  dydx: {
    takerAccount: string;
    expirationInSeconds: number;
    defaultPair: pair;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: {
      kms: string;
      sns: string;
      sqs: string;
      sm: string;
    };
  };
  redis: {
    port: number;
    host: string;
  };
  intervals: {
    fundMonitor: number;
    orderMonitor: number;
  };
  sqs: {
    senderName: string; // TODO: si esto cambia a un id, entonces mejor "senderId"
    receiverName: string;
    strategyQueueUrl: string;
    tradeOpsQueueUrl: string;
    logTopicArn: string;
    msjGroupId: string;
    consumerBatchSize: number;
  };
  sns: {
    logLevel: snsDebugLogLevel;
  }
}
