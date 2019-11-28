import { IToken } from '@entities';
import { MarketId } from '@dydxprotocol/solo';

// TODO: redefine name and behavior of the isBase attribute to function as tri-state
export const DYDX_TOKENS: IToken[] = [
  {
    id: MarketId.WETH.toNumber(),
    shortName: 'WETH',
    weiUnit: 'e18',
    isBase: false,
    priceUnit: 'e0'
  },
  {
    id: MarketId.USDC.toNumber(),
    shortName: 'USDC',
    weiUnit: 'e6',
    isBase: true,
    priceUnit: 'e12'
  },
  {
    id: MarketId.DAI.toNumber(),
    shortName: 'DAI',
    weiUnit: 'e18',
    isBase: true,
    priceUnit: 'e0'
  }
];
