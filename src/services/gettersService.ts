import { IResponseOrder, IOrderbook, IFundsBalances, IToken, IBalance } from '@entities';
import {
  Solo,
  BigNumber,
  ApiMarketName,
  ApiOrderOnOrderbook,
  ApiFill
} from '@dydxprotocol/solo';
import {
  convertToResponseOrder,
  getTokensFromPair,
  parseApiOrderbook,
  parseApiFill,
  parseApiTrade
} from '../helpers/converters';
import { DYDX_TOKENS } from '../constants/Tokens';
import { Time } from '@shared';
import config from '@config';

/* LOAD CONFIG */
let DEFAULT_ADDRESS: string = config.account.defaultAddress;
const DEFAULT_PAIR: string = config.dydx.defaultPair;

/* CONSTANTS */
const DEFAULT_LIMIT: number = 10;

// Injected dependencies
let _solo: Solo;
const TOKEN_WETH: IToken = DYDX_TOKENS[0];

class GettersService {
  private redisManager: any;
  private observerEmitter: any;

  public setDefaultAccount(account: string) {
    DEFAULT_ADDRESS = account;
  }

  public setDependencies(solo: Solo) {
    _solo = solo;
  }

  public async getOrders({
    account,
    limit = 100,
    pairs
  }: {
    account?: string;
    limit?: number;
    pairs?: string[];
  }) {
    const { orders } = await _solo.api.getOrders({
      limit,
      makerAccountOwner: account,
      pairs
    });

    return orders;
  }

  public async getMyOrders(pair: string) {
    const [assetToken, baseToken] = getTokensFromPair(pair);

    const apiOrders = await this.getOrders({
      account: DEFAULT_ADDRESS,
      pairs: [
        `${assetToken.shortName}-${baseToken.shortName}`,
        `${baseToken.shortName}-${assetToken.shortName}`
      ]
    });
    const parsedOrders = apiOrders.map((apiOrder) => convertToResponseOrder(apiOrder));
    return parsedOrders;
  }

  public async getOrderById(orderId: string): Promise<IResponseOrder> {
    const { order } = await _solo.api.getOrder({ id: orderId });
    const responseOrder = convertToResponseOrder(order);

    return responseOrder;
  }

  public async getOrderbook(pair: string, limit = 100): Promise<IOrderbook> {
    const [assetToken, baseToken] = getTokensFromPair(pair);
    const marketName: string = `${assetToken.shortName}-${baseToken.shortName}`;

    const { bids, asks } = await _solo.api.getOrderbookV2({
      market: ApiMarketName.WETH_DAI.includes(marketName)
        ? ApiMarketName.WETH_DAI
        : ApiMarketName.WETH_USDC
    });

    const parsedOrderbook = await Promise.all([
      asks.map((order: ApiOrderOnOrderbook) =>
        parseApiOrderbook(order, assetToken, baseToken)
      ),
      bids.map((order: ApiOrderOnOrderbook) =>
        parseApiOrderbook(order, assetToken, baseToken)
      )
    ]);

    const sellOrders = parsedOrderbook[0].slice(0, limit / 2);
    const buyOrders = parsedOrderbook[1].slice(0, limit / 2);
    return {
      sellOrders,
      buyOrders
    };
  }

  public async getMyFills(
    limit: number,
    pair: string,
    startingBefore: Date = new Date()
  ) {
    const [assetToken, baseToken] = getTokensFromPair(pair);
    const { fills } = await _solo.api.getFills({
      makerAccountOwner: DEFAULT_ADDRESS,
      startingBefore,
      limit,
      pairs: [
        `${assetToken.shortName}-${baseToken.shortName}`,
        `${baseToken.shortName}-${assetToken.shortName}`
      ]
    });
    const fillsList: any = fills;
    const parsedFills = fillsList.map((fill: ApiFill) => {
      return parseApiFill(fill);
    });

    return parsedFills;
  }

  public async getAsk(pair: string) {
    const limit = 50;
    const orderbook = await this.getOrderbook(pair, limit);
    const askPrice = orderbook.sellOrders[0].price;
    return askPrice;
  }

  public async getBid(pair: string) {
    const limit = 50;
    const orderbook = await this.getOrderbook(pair, limit);
    const buyPrice = orderbook.buyOrders[0].price;
    return buyPrice;
  }

  public async getBalances(accountOwner = DEFAULT_ADDRESS): Promise<IFundsBalances> {
    if (DEFAULT_ADDRESS) {
      const account = await _solo.api.getAccountBalances({
        accountOwner,
        accountNumber: new BigNumber(0)
      });
      const balances = account.balances;

      // TODO: obtener "usdAmount"
      const eth: IBalance = {
        token: 'eth',
        amount: _solo.web3.utils.fromWei(new BigNumber(balances['0'].wei).toFixed(0)),
        usdAmount: 0
      };

      const usdcInWei = new BigNumber(balances['2'].wei).toNumber();
      const usdc: IBalance = {
        token: 'usdc',
        amount: (usdcInWei / Number(`1${TOKEN_WETH.weiUnit}`)).toString(),
        usdAmount: 0
      };

      const dai: IBalance = {
        token: 'dai',
        amount: _solo.web3.utils.fromWei(new BigNumber(balances['3'].wei).toFixed(0)),
        usdAmount: 0
      };

      return {
        virtualWalletId: account.uuid,
        balances: [eth, usdc, dai],
        oldestBalancesTimestamp: Time.current().unix
      };
    }
    throw new Error('DEFAULT ADDRESS IS EMPTY');
  }

  public async getTrades({
    account,
    limit = DEFAULT_LIMIT,
    startingBefore = new Date(),
    pair = DEFAULT_PAIR
  }: {
    account?: string;
    limit?: number;
    startingBefore?: Date;
    pair?: string;
  }) {
    const [assetToken, baseToken] = getTokensFromPair(pair);

    const { trades } = await _solo.api.getTrades({
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
      return parseApiTrade(trade);
    });
    return parsedTrades;
  }
}

export const gettersService = new GettersService();
