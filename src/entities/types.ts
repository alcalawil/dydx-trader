/*************************************** TYPES ******************************************/

export type env = 'production' | 'development' | 'test';

export type ResponseParams = {
  responseId?: string;
  requestId: string;
  authentication?: Authentication; // TODO: Por ahora no requerido
  unixTimestamp: number;
  speed: number;
  expired?: boolean;
  errorDescription?: string;
};

export type Authentication = {
  instance: string;
  processId: string;
  softwareId: string;
  version: string;
  requesterId: string;
  signature: string; // TODO: debe ser de tipo Byte[]
  sqsQueueArn: string;
}

// TODO: Implementar mas adelante en el body de las rutas
// export type RequestParams = {
//   requestId: string;
//   authentication?: Authentication;
//   unixTimestamp: number;
//   manual: boolean;
//   test: boolean;
//   expiration: number;
//   maxRetries?: number;
// }
// export type operationType = 'buy' | 'sell' | 'cancel';

export type pair = 'WETH-DAI' | 'WETH-USDC' | ''; // TODO: continuar...

export type financialAsset = 'eth' | 'usdc' | 'dai';

export type observer = NodeJS.Timeout[];

export type logLevel =
  | 'error'
  | 'warn'
  | 'help'
  | 'data'
  | 'info'
  | 'debug'
  | 'prompt'
  | 'verbose'
  | 'input'
  | 'silly'
  | 'security';

export type snsDebugLogLevel = '1' | '2' | '3' | '4' | '5';

/************************************* CONSTANTS ****************************************/

export const MarketSide = {
  sell: 0,
  buy: 1
};

export const MarketSideString = ['sell', 'buy'];

/************************************* MODULES ******************************************/

declare module 'redis' {
  export interface RedisClient extends NodeJS.EventEmitter {
    setAsync(key: string, value: string): Promise<void>;
    getAsync(key: string): Promise<string>;
  }
}
