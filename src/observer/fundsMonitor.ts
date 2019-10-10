import fundsFactory from '../modules/fundsManager';
import { solo } from '../modules/solo';
import { EventEmitter } from 'events';
import { IBalances, IFundsBalances, IResponseOrder } from '@entities';
import { updateBalance, setBalance, getBalances } from '../cache/redisManager';
import { logger } from '@shared';
import { ApiOrderStatus } from '@dydxprotocol/solo';
import awsManager from '../modules/awsManager';

const fundsManager = fundsFactory(solo);
const MAX_QTY_ETH = parseFloat(process.env.MAX_QTY_ETH || '1');
let BALANCES: IFundsBalances[];

class FundsController {
  private observerEvents: EventEmitter;
  constructor(event: EventEmitter) {
    this.observerEvents = event;
    this.initialize();
    this.observerEvents.on('orderChanges', (order: IResponseOrder) => {
      if (
        order.status.includes(ApiOrderStatus.FILLED) ||
        order.status.includes(ApiOrderStatus.PARTIALLY_FILLED)
      ) {
        this.updateBalance(order);
      }
    });
  }

  private async initialize() {
    BALANCES = await getBalances();
  }

  public async updateBalance(order: IResponseOrder) {
    const amounts: IBalances = await fundsManager.getBalances(order.account);
    const newBalance: IFundsBalances = {
      account: order.account,
      eth: parseFloat(amounts.eth),
      dai: parseFloat(amounts.dai),
      usdc: parseFloat(amounts.usdc)
    };
    const balanceIndex = BALANCES.findIndex(
      (item: IFundsBalances) => item.account === newBalance.account
    );
    if (balanceIndex !== -1) {
      updateBalance(newBalance, balanceIndex);
      logger.info(`The Balance was updated for account: ${newBalance.account}`);
      awsManager.publishToSQS('updateBalance', newBalance);
    } else {
      BALANCES.push(newBalance);
      setBalance(newBalance);
      awsManager.publishToSQS('updateBalance', newBalance);
      logger.info(`The Balance was created for account: ${newBalance.account}`);
    }
    if (newBalance.eth >= MAX_QTY_ETH) {
      this.stopHeadOrders(newBalance);
    }
  }

  private stopHeadOrders(balance: IFundsBalances) {
    const msg = {
      message: 'maximum amount of eth reached',
      ...balance
    };
    awsManager.publishToSQS('stopOps', msg);
    awsManager.publishLogToSNS('stopOps', msg);
  }
}

export default FundsController;
