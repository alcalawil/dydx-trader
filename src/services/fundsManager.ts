import { Solo, BigNumber } from '@dydxprotocol/solo';
import { IBalances } from '@entities';
import { awsManager } from '@services';
import { DYDX_TOKENS } from '../constants/Tokens';

let DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';
const ENCRYPTED_DEFAULT_ADDRESS = process.env.ENCRYPTED_DEFAULT_ADDRESS || '';
const TOKEN_WETH = DYDX_TOKENS[0];

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
}

export const fundsFactory = (solo: Solo) => new FundsManager(solo);
