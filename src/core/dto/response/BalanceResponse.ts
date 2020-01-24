import { IResponseParams, IFundsBalances, IAsset } from '@entities';
import Response from '../Response';

export default class BalanceResponse extends Response {
  private virtualWalletId: string;
  private balances: IAsset[];
  private oldestBalancesTimestamp: number;

  constructor(
    resParams: IResponseParams,
    { virtualWalletId, balances, oldestBalancesTimestamp }: IFundsBalances
  ) {
    super(resParams);
    this.virtualWalletId = virtualWalletId;
    this.balances = balances;
    this.oldestBalancesTimestamp = oldestBalancesTimestamp;
  }
}
