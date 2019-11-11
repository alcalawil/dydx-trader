import { IToken } from '@entities';
import { MarketId } from '@dydxprotocol/solo';

export const DYDX_TOKENS: IToken[] = [
    {
      id: MarketId.WETH.toNumber(),
      shortName: 'WETH',
      weiUnit: 'e18',
      isBase: false
    },
    {
      id: MarketId.DAI.toNumber(),
      shortName: 'DAI',
      weiUnit: 'e18',
      isBase: true
    },
    {
      id: MarketId.USDC.toNumber(),
      shortName: 'USDC',
      weiUnit: 'e6',
      isBase: true
    }
];
