/*************************************** TYPES ******************************************/

export type env = 'production' | 'development' | 'test';

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
