import { EventEmitter } from 'events';
import {
  IBalances,
  IFundsBalances,
  IRedisManager,
  IAwsManager,
  ISQSPublisher
} from '@entities';
import { logger } from '@shared';
import config from '../config';
import { BALANCES_CHANGES, STOP_OPS } from '../constants/Topics';

let BALANCE: IFundsBalances;

class FundsController {
  // private redisManager: IRedisManager;
  private awsManager: IAwsManager;
  private fundsManager: any;
  private sqsPublisher: ISQSPublisher;

  constructor(
    awsManager: IAwsManager,
    fundsManager: any,
    sqsPublisher: ISQSPublisher,
    redisManager?: IRedisManager
  ) {
    // this.redisManager = redisManager;
    this.awsManager = awsManager;
    this.fundsManager = fundsManager;
    this.sqsPublisher = sqsPublisher;
    this.initialize();
  }

  private async initialize() {
    // BALANCES = await this.redisManager.getBalances();
    const amounts: IBalances = await this.fundsManager.getBalances();
    BALANCE = {
      eth: parseFloat(amounts.eth),
      usdc: parseFloat(amounts.usdc),
      dai: parseFloat(amounts.dai)
    };
  }

  public async checkBalance() {
    const amounts: IBalances = await this.fundsManager.getBalances();
    const newBalance: IFundsBalances = {
      eth: parseFloat(amounts.eth),
      usdc: parseFloat(amounts.usdc),
      dai: parseFloat(amounts.dai)
    };
    if (
      newBalance.dai !== BALANCE.dai ||
      newBalance.usdc !== BALANCE.usdc ||
      newBalance.eth !== BALANCE.eth
    ) {
      logger.debug('the balance was changed');
      this.sqsPublisher.publishToSQS(BALANCES_CHANGES, JSON.stringify(amounts));
      BALANCE = newBalance;
      if (newBalance.eth >= config.fundsMonitor.maxEthQty) {
        logger.debug('stop ops');
        this.stopOrders(newBalance);
      }
    }
  }

  private stopOrders(balance: IFundsBalances) {
    this.sqsPublisher.publishToSQS(STOP_OPS, JSON.stringify(balance));
    this.awsManager.publishLogToSNS(STOP_OPS, balance);
  }
}

export default (
  awsManager: IAwsManager,
  fundsManager: any,
  sqsPublisher: ISQSPublisher,
  redisManager?: IRedisManager
) => new FundsController(awsManager, fundsManager, sqsPublisher, redisManager);
