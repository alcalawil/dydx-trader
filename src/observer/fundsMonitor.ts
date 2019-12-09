import { EventEmitter } from 'events';
import {
  IBalances,
  IFundsBalances,
  IResponseOrder,
  IRedisManager,
  IAwsManager
} from '@entities';
import { logger } from '@shared';
import { ApiOrderStatus } from '@dydxprotocol/solo';
import config from '../config';

let BALANCES: IFundsBalances[];

class FundsController {
  private observerEvents: EventEmitter;
  private redisManager: IRedisManager;
  private awsManager: IAwsManager;
  private fundsManager: any;

  constructor(
    event: EventEmitter,
    redisManager: IRedisManager,
    awsManager: IAwsManager,
    fundsManager: any
  ) {
    this.observerEvents = event;
    this.redisManager = redisManager;
    this.observerEvents.on('orderChanges', (order: IResponseOrder) => {
      if (
        order.status.includes(ApiOrderStatus.FILLED) ||
        order.status.includes(ApiOrderStatus.PARTIALLY_FILLED)
      ) {
        this.updateBalance(order);
      }
    });
    this.awsManager = awsManager;
    this.fundsManager = fundsManager;
    this.initialize();
  }

  private async initialize() {
    BALANCES = await this.redisManager.getBalances();
  }

  public async updateBalance(order: IResponseOrder) {
    const amounts: IBalances = await this.fundsManager.getBalances(order.account);
    const newBalance: IFundsBalances = {
      account: order.account,
      eth: parseFloat(amounts.eth),
      usdc: parseFloat(amounts.usdc),
      dai: parseFloat(amounts.dai)
    };
    const balanceIndex = BALANCES.findIndex(
      (item: IFundsBalances) => item.account === newBalance.account
    );
    if (balanceIndex !== -1) {
      this.redisManager.updateBalance(newBalance, balanceIndex);
      logger.info(`The Balance was updated for account: ${newBalance.account}`);
      this.awsManager.publishToSQS('updateBalance', newBalance);
    } else {
      BALANCES.push(newBalance);
      this.redisManager.setBalance(newBalance);
      this.awsManager.publishToSQS('updateBalance', newBalance);
      logger.info(`The Balance was created for account: ${newBalance.account}`);
    }
    if (newBalance.eth >= config.fundsMonitor.maxEthQty) {
      this.stopOrders(newBalance);
    }
  }

  private stopOrders(balance: IFundsBalances) {
    const msg = {
      message: 'maximum amount of eth reached',
      ...balance
    };
    this.awsManager.publishToSQS('stopOps', msg);
    this.awsManager.publishLogToSNS('stopOps', msg);
  }
}

export default FundsController;
