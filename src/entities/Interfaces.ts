import BigNumber from 'bignumber.js';
import { EventEmitter } from 'events';
import { financialAsset, logLevel, snsDebugLogLevel, pair } from './types';

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
  balances: IAsset[];
  oldestBalancesTimestamp: number; // TODO: Buscar otro nombre
}

export interface IAsset {
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

export interface ISNSLogger {
  LogMessage: (
    action: string,
    body: any,
    logType: string,
    logLvl?: logLevel,
    dbgLogLvl?: snsDebugLogLevel
  ) => Promise<any>;
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

export interface ICacheDB {
  getValueFromCache: (key: string) => Promise<string>;
  setValueInCache: (key: string, value: string) => Promise<void>;
}

export interface ILogBody extends Partial<IOperation>, Partial<IStrategyInfo> {
  details: any;
  topic?: string;
}

export interface ILogType {
  codeType: string;
  action: string;
  logLevel: logLevel;
  debugLogLevel: snsDebugLogLevel;
}

export interface IResponseParams {
  responseId?: string;
  requestId: string;
  authentication?: IAuthentication; // TODO: Por ahora no requerido
  unixTimestamp: number;
  speed: number;
  expired?: boolean;
  errorDescription?: string;
}

export interface IAuthentication {
  instance: string;
  processId: string;
  softwareId: string;
  version: string;
  requesterId: string;
  signature: string; // TODO: debe ser de tipo Byte[]
  sqsQueueArn: string;
}

export interface IOper {
  quantity: number;
  price: number;
  fees: number;
  asset1: financialAsset,
  aseet2: financialAsset,
  timestamp: number; // TODO: Sera unix ó utc
}

// TODO: Implementar mas adelante en el body de las rutas
// export interface RequestParams {
//   requestId: string;
//   authentication?: Authentication;
//   unixTimestamp: number;
//   manual: boolean;
//   test: boolean;
//   expiration: number;
//   maxRetries?: number;
// }
