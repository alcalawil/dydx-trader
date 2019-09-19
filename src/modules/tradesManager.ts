import {
  Solo
} from '@dydxprotocol/solo';

const DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';

class TradesManager {
  public solo: Solo;
  constructor(solo: Solo) {
    this.solo = solo;
  }

  public async getTrades({
    account,
    limit = 10,
    startingBefore = new Date(),
    pairs = ['WETH-DAI', 'DAI-WETH']
  }: {
    account?: string;
    limit?: number;
    startingBefore?: Date;
    pairs?: string[]
  }) {
    const trades = await this.solo.api.getTrades({
      startingBefore,
      limit,
      makerAccountOwner: account,
      pairs
    });

    return trades;
  }

  public async getOwnTrades(account = DEFAULT_ADDRESS) {
    const trades = await this.getTrades({ account });
    return trades;
  }

}

export default (solo: Solo) => new TradesManager(solo);