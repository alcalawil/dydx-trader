export interface IConfig {
  app: {
    nodeEnv: string;
    logLevel: string;
    apiKey: string
  };
  server: {
    port: number;
    httpProvider: string;
  };
  account: {
    normal: { // TODO: normal ?, evaluar este nombre
      defaultAddress: string;
      privateKey: string;
    };
    encrypted: {
      defaultAddress: string;
      privateKey: string;
    };
  };
  dydx: {
    takerAccount: string;
    expirationInSeconds: number;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: {
      kms: string;
      sns: string;
      sm: string;
    }
  };
  redis: {
    port: number;
    host: string;
  };
  observer: {
    interval: number;
    maxQtyEth: number;
  };
  sqs: {
    senderName: string; // TODO: si esto cambia a un id, entonces mejor "senderId"
    receiverName: string;
    strategyQueueUrl: string;
    consumerQueueUrl: string;
    transactionalLog: string;
    region: string;
  };
}

// TODO: separar los types de config en "startegies" tambien
