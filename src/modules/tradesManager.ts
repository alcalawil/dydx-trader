import {
  Solo,
  MarketId,
  ApiTrade
} from '@dydxprotocol/solo';
import {
  calculatePrice,
} from '../shared/utils';
import {
  IResponseTrade
} from '../entities/types';

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
    const { trades } = await this.solo.api.getTrades({
      startingBefore,
      limit,
      makerAccountOwner: account,
      pairs
    });
    return trades;
  }

  public async getOwnTrades(limit: number, startingBefore: Date) {
    const trades: any = await this.getTrades({ account: DEFAULT_ADDRESS, limit, startingBefore });
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

    const makerMarket = makerOrder.pair.makerCurrency.soloMarket;
    const price = calculatePrice({
      makerMarket: makerOrder.pair.makerCurrency.soloMarket,
      takerMarket: makerOrder.pair.takerCurrency.soloMarket,
      makerAmount,
      takerAmount
    });

    let side: string;
    let amount: string;

    if (makerMarket === MarketId.WETH.toNumber()) {
      side = 'SELL'; // Si estoy ofreciendo WETH, significa que estoy vendiendo
      amount = this.solo.web3.utils.fromWei(makerAmount, 'ether');
    } else {
      side = 'BUY';
      amount = this.solo.web3.utils.fromWei(takerAmount, 'ether');
    }

    const responseTrade: IResponseTrade = {
      transactionHash,
      pair: 'ETH-DAI',
      side,
      createdAt,
      price,
      amount: parseFloat(amount),
      status
    };

    return responseTrade;
  }
}

export default (solo: Solo) => new TradesManager(solo);