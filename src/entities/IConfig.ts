export default interface IConfig {
  sqs: {
    consumerQueueUrl: string;
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
}
