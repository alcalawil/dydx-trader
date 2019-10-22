import { Solo, BigNumber } from '@dydxprotocol/solo';
import { IBalances } from '../entities/types';

const DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';

class FundsManager {
  public solo: Solo;

  constructor(solo: Solo) {
    this.solo = solo;
  }

  public async getBalances(accountOwner = DEFAULT_ADDRESS): Promise<IBalances> {
    const balances = await this.solo.api.getAccountBalances({
      accountOwner,
      accountNumber: new BigNumber(0)
    });

    const eth = this.solo.web3.utils.fromWei(
      new BigNumber(balances.balances['0'].wei).toFixed(0)
    );

    const dai = this.solo.web3.utils.fromWei(
      new BigNumber(balances.balances['1'].wei).toFixed(0)
    );

    const usdcInWei = new BigNumber(balances.balances['2'].wei).toNumber();
    const usdc = (usdcInWei / Number('1e6')).toString();

    return {
      eth,
      dai,
      usdc
    };
  }
}

export default (solo: Solo) => new FundsManager(solo);
