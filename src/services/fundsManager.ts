import { Solo, BigNumber } from '@dydxprotocol/solo';
import { IBalances, IToken } from '@entities';
import { awsManager } from '@services';
import { DYDX_TOKENS } from '../constants/Tokens';
import config from '@config';

let DEFAULT_ADDRESS: string = config.account.defaultAddress;
const TAG_ADDRESS: string = config.secretManager.tagAddress;
const TOKEN_WETH: IToken = DYDX_TOKENS[0];

class FundsManager {
  public solo: Solo;

  constructor(solo: Solo) {
    this.solo = solo;

    if (!DEFAULT_ADDRESS) {
      this.loadAddress(TAG_ADDRESS);
    }
  }

  private async loadAddress(address: string) {
    DEFAULT_ADDRESS = await awsManager.decryptSecretName(address);
  }

  public async getBalances(accountOwner = DEFAULT_ADDRESS): Promise<IBalances> {
    if (DEFAULT_ADDRESS) {
      const account = await this.solo.api.getAccountBalances({
        accountOwner,
        accountNumber: new BigNumber(0)
      });

      const balances = account.balances;

      const eth = this.solo.web3.utils.fromWei(
        new BigNumber(balances['0'].wei).toFixed(0)
      );

      const usdcInWei = new BigNumber(balances['2'].wei).toNumber();
      const usdc = (usdcInWei / Number(`1${TOKEN_WETH.weiUnit}`)).toString();

      const dai = this.solo.web3.utils.fromWei(
        new BigNumber(balances['3'].wei).toFixed(0)
      );

      return {
        eth,
        usdc,
        dai
      };
    }
    throw new Error('DEFAULT ADDRESS IS EMPTY');
  }
}

export const fundsFactory = (solo: Solo) => new FundsManager(solo);
