import { IBalances, IRedisManager, IAwsManager, ISQSPublisher } from '@entities';
import { logger } from '@shared';
import config from '../config';
import { BALANCES_CHANGES, STOP_OPS } from '@topics';

let BALANCE: IBalances = {
  dai: '0',
  eth: '0',
  usdc: '0',
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
    BALANCE = await this.fundsManager.getBalances();
  }

  public async checkBalance() {
    const newBalance: IBalances = await this.fundsManager.getBalances();
    const ethQty = Number(newBalance.eth);
    if (
      newBalance.dai !== BALANCE.dai ||
      newBalance.usdc !== BALANCE.usdc ||
      newBalance.eth !== BALANCE.eth
    ) {
      logger.debug('the balance was changed');
      this.sqsPublisher.publishToSQS(BALANCES_CHANGES, JSON.stringify(newBalance));
      BALANCE = newBalance;
      if (ethQty >= config.fundsMonitor.maxEthQty) {
        logger.debug('stop ops');
        this.stopOrders(newBalance);
      }
    }
  }

  private stopOrders(balance: IBalances) {
    this.sqsPublisher.publishToSQS(STOP_OPS, JSON.stringify(balance));
    this.awsManager.publishLogToSNS(STOP_OPS, balance);
  }
}

export default (
  awsManager: IAwsManager,
  fundsManager: any,
  sqsPublisher: ISQSPublisher,
  redisManager?: IRedisManager
) => new FundsMonitor(awsManager, fundsManager, sqsPublisher, redisManager);
