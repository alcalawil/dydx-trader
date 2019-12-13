import { Solo } from '@dydxprotocol/solo';
import { getTokens, convertToCexOrder } from '@shared';
import { IResponseTrade, MarketSideString } from '@entities';
import { awsManager } from '@services';

let DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';
const ENCRYPTED_DEFAULT_ADDRESS = process.env.ENCRYPTED_DEFAULT_ADDRESS || '';
const PAIR_DEFAULT = 'WETH-DAI';

class TradesManager {
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

  public async getTrades({
    account,
    limit = 10,
    startingBefore = new Date(),
    pair = PAIR_DEFAULT
  }: {
    account?: string;
    limit?: number;
    startingBefore?: Date;
    pair?: string;
  }) {
    const [assetToken, baseToken] = getTokens(pair);

    const { trades } = await this.solo.api.getTrades({
      startingBefore,
      limit,
      makerAccountOwner: account,
      pairs: [
        `${assetToken.shortName}-${baseToken.shortName}`,
        `${baseToken.shortName}-${assetToken.shortName}`
      ]
    });
    return trades;
  }

  public async getOwnTrades(
    limit: number,
    pair: string,
    startingBefore: Date = new Date()
  ) {
    const trades: any = await this.getTrades({
      account: DEFAULT_ADDRESS,
      limit,
      startingBefore,
      pair
    });
    const parsedTrades: any = trades.map((trade: any) => {
      return this.parseApiTrade(trade);
    });
    return parsedTrades;
  }

  private parseApiTrade(tradeApi: any): IResponseTrade {
    const {
      transactionHash,
      makerOrder,
      createdAt,
      makerAmount,
      takerAmount,
      status
    } = tradeApi;

    const { price, amount, side } = convertToCexOrder({
      makerMarket: makerOrder.pair.makerCurrency.soloMarket,
      takerMarket: makerOrder.pair.takerCurrency.soloMarket,
      makerAmount,
      takerAmount
    });

    const responseTrade: IResponseTrade = {
      transactionHash,
      pair: makerOrder.pair.name,
      side: MarketSideString[side],
      createdAt,
      price,
      amount,
      status
    };

    return responseTrade;
  }
}

export const tradesFactory = (solo: Solo) => new TradesManager(solo);
