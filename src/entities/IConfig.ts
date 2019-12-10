export default interface IConfig {
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
}
