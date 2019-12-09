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
  expiresAt: string | undefined;
  price: number;
  amount: number;
  status: string;
  amountFilled?: number;
  amountRemaining?: number;
}

export interface IHTTPError {
  status: number;
  message: string;
}

export interface IBalances {
  eth: string;
  usdc: string;
  dai: string;
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
  isRunning: boolean;
}

export interface ISQSRoute {
  topic: string;
  handler: (body: any) => Promise<any>;
}

export interface IFundsBalances {
  account: string;
  eth: number;
  usdc: number;
  dai: number;
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
  publishLogToSNS: (operation: string, message: any, level?: string) => Promise<any>;
  getSecretValue: (secretName: string) => Promise<any>;
  decryptSecretName: (privateKey: string) => Promise<any>;
  publishToSQS: (groupId: string, msg: any, extraAttributes?: any) => Promise<any>;
}
