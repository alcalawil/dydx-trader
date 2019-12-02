import { Solo, BigNumber } from '@dydxprotocol/solo';
import { IBalances } from '../entities/types';
import awsManager from './awsManager';

let DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';
const ENCRYPTED_DEFAULT_ADDRESS = process.env.ENCRYPTED_DEFAULT_ADDRESS || '';

class FundsManager {
  public solo: Solo;

  constructor(solo: Solo) {
    this.solo = solo;
    if (!DEFAULT_ADDRESS) {
      this.loadAddress(ENCRYPTED_DEFAULT_ADDRESS);
    }
  }

  private async loadAddress(address: string) {
    DEFAULT_ADDRESS = await awsManager.decryptSecretName(address);
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

    const sai = this.solo.web3.utils.fromWei(
      new BigNumber(balances.balances['3'].wei).toFixed(0)
    );

    return {
      eth,
      dai,
      usdc,
      sai
    };
  }
}

export default (solo: Solo) => new FundsManager(solo);
