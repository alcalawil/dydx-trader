import { pair, logLevel } from './types';

export interface IConfig {
  app: {
    nodeEnv: string;
    logLevel: logLevel;
    apiKey: string;
    version: string;
  };
  server: {
    port: number;
    httpProvider: string;
  };
  account: {
    defaultAddress: string;
    privateKey: string;
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
  observer: {
    interval: {
      fundMonitor: number;
      orderMonitor: number;
    };
    maxQtyEth: number;
  };
  sqs: {
    senderName: string; // TODO: si esto cambia a un id, entonces mejor "senderId"
    receiverName: string;
    strategyQueueUrl: string;
    tradeOpsQueueUrl: string;
    logTopicArn: string;
    msjGroupId: string;
    consumerBatchSize: number;
    logLevel: string;
  };
}

// TODO: separar los types de config en "startegies" tambien
