import 'mocha';
import { expect } from 'chai';
import BigNumber from 'bignumber.js';

/* MODULES */
import { MarketSide, ICexOrder, IDexOrder, IToken } from '../src/entities/types';
import { DYDX_TOKENS } from '../src/constants/Tokens';
import {
  getTokens,
  convertToDexOrder,
  convertToCexOrder,
  convertFromWei
} from '../src/shared/utils';

/* CONSTANTS */
const {
  PRICE,
  AMOUNT,
  TAKER_AMOUNT,
  MAKET_AMOUNT
} = process.env as any;

const assetToken: IToken = DYDX_TOKENS[0];
const baseToken: IToken = DYDX_TOKENS[1];

const takerToken: IToken = assetToken;
const makerToken: IToken = baseToken;

function cexOrder(side: number): ICexOrder {
  return {
    price: PRICE,
    amount: AMOUNT,
    side
  };
}

function dexOrder(side: number): IDexOrder {
  let takerMarket, makerMarket;

  if (side === MarketSide.sell) {
    takerMarket = 1;
    makerMarket = 0;
  } else {
    takerMarket = 0;
    makerMarket = 1;
  }

  return {
    takerAmount: TAKER_AMOUNT,
    makerAmount: MAKET_AMOUNT,
    takerMarket,
    makerMarket
  };
}

const pairTypes = [
  {
    title: 'Case: Normal Pair',
    name: 'WETH-DAI'
  },
  {
    title: 'Case: Inverter Pair',
    name: 'DAI-WETH'
  }
];

describe('Order Convertions Test', () => {
  describe('Convert To Dex Order', () => {
    pairTypes.map((pair) => {
      describe(pair.title, () => {
        const PAIR = pair.name;

        it('Get Tokens', () => {
          const expectedOutput = [assetToken, baseToken];

          const result = getTokens(PAIR);
          expect(result).to.eql(expectedOutput);
        });

        it('Order Sell', () => {
          const SIDE = MarketSide.sell;
          const takerAmount = PRICE * AMOUNT;

          const expectedOutput = {
            makerMarket: new BigNumber(assetToken.id),
            takerMarket: new BigNumber(baseToken.id),
            makerAmount: `${AMOUNT}${assetToken.weiUnit}`,
            takerAmount: `${takerAmount}${baseToken.weiUnit}`
          };

          const result = convertToDexOrder(cexOrder(SIDE), PAIR);
          expect(result).to.eql(expectedOutput);
        });

        it('Order Buy', () => {
          const SIDE = MarketSide.buy;
          const makerAmount = PRICE * AMOUNT;

          const expectedOutput = {
            makerMarket: new BigNumber(baseToken.id),
            takerMarket: new BigNumber(assetToken.id),
            makerAmount: `${makerAmount}${baseToken.weiUnit}`,
            takerAmount: `${AMOUNT}${assetToken.weiUnit}`
          };

          const result = convertToDexOrder(cexOrder(SIDE), PAIR);
          expect(result).to.eql(expectedOutput);
        });
      });
    });
  });

  describe('Convert To Cex Order', () => {
    it('Convert From Wei', () => {
      const wei = new BigNumber(MAKET_AMOUNT);
      const weiUnit = makerToken.weiUnit;

      const expectedOutput = wei.dividedBy(`1${weiUnit}`).toNumber();
      console.log(expectedOutput);

      const result = convertFromWei(new BigNumber(MAKET_AMOUNT), makerToken);
      expect(result).to.eql(expectedOutput);
    });

    it('Order Sell', () => {
      const SIDE = MarketSide.sell;

      const expectedOutput = {
        amount: convertFromWei(new BigNumber(MAKET_AMOUNT), makerToken),
        price: parseFloat(TAKER_AMOUNT) / parseFloat(MAKET_AMOUNT),
        side: SIDE
      };

      const result = convertToCexOrder(dexOrder(SIDE));
      expect(result).to.eql(expectedOutput);
    });

    it('Order Buy', () => {
      const SIDE = MarketSide.buy;

      const expectedOutput = {
        amount: convertFromWei(new BigNumber(TAKER_AMOUNT), takerToken),
        price: parseFloat(MAKET_AMOUNT) / parseFloat(TAKER_AMOUNT),
        side: SIDE
      };

      const result = convertToCexOrder(dexOrder(SIDE));
      expect(result).to.eql(expectedOutput);
    });
  });
});
