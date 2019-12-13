export interface IConfig {
  sqs: {
    consumerQueueUrl: string;
    region: string;
    strategyQueueUrl: string;
  };
  redis: {
    port: number;
    host: string;
  };
  fundsMonitor: {
    maxEthQty: number;
  };
  observer: {
    interval: number;
  };
  transactionalLog: {
    queueArn: string;
  };
  solo: {
    httpProvider: string;
  };
}

// TODO: separar los types de config en "startegies" tambien
