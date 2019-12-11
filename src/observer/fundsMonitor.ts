import { EventEmitter } from 'events';
import {
  IBalances,
  IFundsBalances,
  IResponseOrder,
  IRedisManager,
  IAwsManager,
  ISQSPublisher,
  observerEvents
} from '@entities';
import { logger } from '@shared';
import { ApiOrderStatus } from '@dydxprotocol/solo';
import config from '../config';
import { BALANCES_CHANGES, STOP_OPS } from '../constants/Topics';

let BALANCES: IFundsBalances[];

class FundsController {
  private observerEmitter: EventEmitter;
  // private redisManager: IRedisManager;
  private awsManager: IAwsManager;
  private fundsManager: any;
  private sqsPublisher: ISQSPublisher;

  constructor(
    event: EventEmitter,
    awsManager: IAwsManager,
    fundsManager: any,
    sqsPublisher: ISQSPublisher,
    redisManager?: IRedisManager
  ) {
    this.observerEmitter = event;
    // this.redisManager = redisManager;
    this.observerEmitter.on(
      observerEvents.orderStatusChanges,
      (order: IResponseOrder) => {
        if (
          order.status.includes(ApiOrderStatus.FILLED) ||
          order.status.includes(ApiOrderStatus.PARTIALLY_FILLED)
        ) {
          this.updateBalance(order);
        }
      }
    );
    this.awsManager = awsManager;
    this.fundsManager = fundsManager;
    this.sqsPublisher = sqsPublisher;
    this.initialize();
  }

  private async initialize() {
    // BALANCES = await this.redisManager.getBalances();
    BALANCES = [];
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
      // this.redisManager.updateBalance(newBalance, balanceIndex);
      logger.debug(`The Balance was updated for account: ${newBalance.account}`);
      this.sqsPublisher.publishToSQS(BALANCES_CHANGES, JSON.stringify(newBalance));
    } else {
      BALANCES.push(newBalance);
      // this.redisManager.setBalance(newBalance);
      this.sqsPublisher.publishToSQS(BALANCES_CHANGES, JSON.stringify(newBalance));
      logger.debug(`The Balance was created for account: ${newBalance.account}`);
    }
    if (newBalance.eth >= config.fundsMonitor.maxEthQty) {
      this.stopOrders(newBalance);
    }
  }

  private stopOrders(balance: IFundsBalances) {
    this.sqsPublisher.publishToSQS(STOP_OPS, JSON.stringify(balance));
    this.awsManager.publishLogToSNS(STOP_OPS, balance);
  }
}

export default FundsController;
