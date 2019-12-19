import { IBalances, IRedisManager, IAwsManager, ISQSPublisher } from '@entities';
import { logger } from '@shared';
import { BALANCES_CHANGES, STOP_OPS } from '@topics';
import config from '@config';

/* LOAD CONFIG */
const MAX_ETH_QTY: number = config.observer.maxQtyEth;

let BALANCE: IBalances = {
  dai: '0',
  eth: '0',
  usdc: '0'
};

class FundsMonitor {
  private awsManager: IAwsManager;
  private fundsManager: any;
  private sqsPublisher: ISQSPublisher;

  constructor(
    awsManager: IAwsManager,
    fundsManager: any,
    sqsPublisher: ISQSPublisher,
    redisManager?: IRedisManager
  ) {
    this.awsManager = awsManager;
    this.fundsManager = fundsManager;
    this.sqsPublisher = sqsPublisher;
  }

  public async initialize() {
    const newBalance = await this.getBalance();
    if (newBalance) {
      BALANCE = newBalance;
    }
  }

  public async checkBalance() {
    const newBalance = await this.getBalance();
    if (newBalance) {
      const ethQty = Number(newBalance.eth);
      if (
        newBalance.dai !== BALANCE.dai ||
        newBalance.usdc !== BALANCE.usdc ||
        newBalance.eth !== BALANCE.eth
      ) {
        logger.debug('the balance was changed');
        this.sqsPublisher.publishToSQS(BALANCES_CHANGES, JSON.stringify(newBalance));
        BALANCE = newBalance;
        if (ethQty >= MAX_ETH_QTY) {
          logger.debug('stop ops');
          this.stopOrders(newBalance);
        }
      }
    }
  }

  private stopOrders(balance: IBalances) {
    this.sqsPublisher.publishToSQS(STOP_OPS, JSON.stringify(balance));
    this.awsManager.publishLogToSNS(STOP_OPS, balance);
  }

  private async getBalance() {
    try {
      const balances: IBalances = await this.fundsManager.getBalances();
      return balances;
    } catch (error) {
      logger.error(`Error trying to get the balances: ${error.message}`);
    }
  }
}

export default (
  awsManager: IAwsManager,
  fundsManager: any,
  sqsPublisher: ISQSPublisher,
  redisManager?: IRedisManager
) => new FundsMonitor(awsManager, fundsManager, sqsPublisher, redisManager);
