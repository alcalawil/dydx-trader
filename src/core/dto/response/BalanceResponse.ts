import { Response } from './Response';
import { ResponseParams, IFundsBalances, IBalance } from '@entities';

export class BalanceResponse extends Response {
  private virtualWalletId: string;
  private balances: IBalance[];
  private oldestBalancesTimestamp: number;

  constructor(
    resParams: ResponseParams,
    { virtualWalletId, balances, oldestBalancesTimestamp }: IFundsBalances
  ) {
    super(resParams);
    this.virtualWalletId = virtualWalletId;
    this.balances = balances;
    this.oldestBalancesTimestamp = oldestBalancesTimestamp;
  }
}
