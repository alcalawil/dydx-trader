import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';

export interface ISimpleOrder extends IDexOrder {
  id?: number;
  expiration?: number;
}

// Standard order used by DEX protocols
export interface IDexOrder {
  takerAmount: string;
  makerAmount: string;
  takerMarket: BigNumber | number;
  makerMarket: BigNumber | number;
}

export interface ICexOrder {
  price: number;
  amount: number;
  side: number;
}

export const MarketSide = {
  sell: 0,
  buy: 1
};

export const MarketSideString = ['sell', 'buy'];

export interface IResponseOrder {
  account: string;
  id: string;
  pair: string;
  side: string;
  createdAt: string;
  expiresAt?: string;
  price: number;
  amount: number;
  status: string;
  amountFilled?: number;
  amountRemaining?: number;
}

export interface IFundsBalances {
  virtualWalletId: string;
  balances: IBalance[];
  oldestBalancesTimestamp: number; // TODO: Buscar otro nombre
}

export interface IBalance {
  token: financialAsset;
  amount: string;
  usdAmount: number;
}

export interface IOrderbook {
  sellOrders: IParsedOrderbook[];
  buyOrders: IParsedOrderbook[];
}

export interface IResponseTrade {
  transactionHash: string;
  pair: string;
  side: string;
  createdAt: string;
  price: number;
  amount: number;
  status: string;
}
export interface IResponseFill {
  transactionHash: string;
  orderId: string;
  pair: string;
  side: string;
  createdAt: string;
  updatedAt: string;
  price: number;
  amount: number;
  fillStatus: string;
  orderStatus: string;
  amountRemaining: number;
  amountFilled: number;
}

export interface IMarket {
  internalSymbol: string;
  dexMarketBuy: string;
  dexMarketSell: string;
  exponential: string;
}

export interface IToken {
  id: number;
  shortName: string;
  weiUnit: string;
  isBase: boolean;
  priceUnit: string;
}

export interface ISQSConsumer {
  start: () => void;
  stop: () => void;
  purge: () => Promise<any>;
  isRunning: boolean;
}

export interface ISQSRoute {
  topic: string;
  handler: (body: any) => Promise<any>;
}

export interface IOrderChange {
  account: string;
  id: string;
  status: string;
  timestamp: string;
}

export interface IParsedOrderbook {
  amount: number;
  price: number;
}

export interface IRedisManager {
  setOpenOrderInCache: (order: IResponseOrder) => void;
  setOrderInCache: (order: IResponseOrder) => void;
  setBalance: (balance: IFundsBalances) => void;
  getCachedOpenOrders: () => Promise<IResponseOrder[]>;
  getCachedOrders: () => Promise<IResponseOrder[]>;
  getBalances: () => Promise<IFundsBalances[]>;
  getBalance: (account: string) => Promise<IFundsBalances>;
  deleteCachedOpenOrder: (order: IResponseOrder) => boolean;
  updateCachedOpenOrder: (order: IResponseOrder, index: number) => boolean;
  updateBalance: (balance: IFundsBalances, index: number) => boolean;
  getEmitter: () => EventEmitter;
}

export interface IAwsManager {
  kmsDecrypt: (encryptedData: string) => Promise<string>;
  kmsEncrypt: (plainText: string) => Promise<string>;
  getSecretValue: (secretName: string) => Promise<any>;
  decryptSecretName: (privateKey: string) => Promise<any>;
  publishToSQS: (groupId: string, msg: any, extraAttributes?: any) => Promise<any>;
  getPublicIP: () => string;
  getInstanceId: () => string;
}

export interface ISQSPublisher {
  publishToSQS: (topic: string, body: string, extraAttributes?: any) => Promise<any>;
}

export interface IOrderStatus {
  orderId: string;
  orderStatus: string;
}
// TODO: mover a "/constants"
export const observerEvents = {
  placeOrder: 'PLACE_ORDER',
  orderStatusChanges: 'ORDER_STATUS_CHANGES'
};

export interface IFundsMonitor {
  checkBalance: () => Promise<void>;
  initialize: () => Promise<void>;
}

export interface IOrdersMonitor {
  checkOrdersStatus: () => Promise<void>;
}

export interface ICancelOrder {
  orderId: string;
}

// FIXME: Por qué dos interfaces iguales con dos nombres distintos?
export interface ICancelResponse {
  orderId: string;
}

export interface IState {
  orders: IResponseOrder[];
  balances: IFundsBalances;
  operations: IOperation[];
}

export class ITime {
  private static current: () => { unix: number; utc: string };
  private static experation: () => { unix: number; utc: string };
}

/****************************************************************************************/

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

export interface ILogType {
  codeType: string;
  action: string;
  logLevel: logLevel;
  debugLogLevel: snsDebugLogLevel;
}

export interface IStrategyInfo {
  strategyInstanceId: string;
  strategyInstanceIp: string;
  strategySoftwareVersion: string;
  subStrategy: string;
  cycleId: string;
  walletId: string;
  virtualWalletId: string;
}
export interface IOperation extends IStrategyInfo {
  pair: pair;
  orderId: string;
  operationId: string;
  tokenIN: string;
  tokenOUT: string;
  tokenFees: string;
  feesOut: number;
  originalRequest: string;
  originalResponse: string;
}

declare module 'redis' {
  export interface RedisClient extends NodeJS.EventEmitter {
    setAsync(key: string, value: string): Promise<void>;
    getAsync(key: string): Promise<string>;
  }
}

export interface ICacheDB {
  getValueFromCache: (key: string) => Promise<string>;
  setValueInCache: (key: string, value: string) => Promise<void>;
}

export interface ILogBody extends Partial<IOperation>, Partial<IStrategyInfo> {
  details: any;
  topic?: string;
}
