class SpreadOrders {
  constructor(range, pair, { useExternalPrice }) {
    this.range = range;
    this.pair = pair;
    this.useExternalPrice = useExternalPrice
  }

  outputOrders(marketData) {
    const { internalPrice, externalPrice } = marketData;
    const cexOrders = [];

    this.range.map(({ spread, amount }) => {
      const { ask, bid } = this.useExternalPrice 
      ? this.calculatePrices(internalPrice, externalPrice, spread)
      : this.calculatePricesOnlyInternal(internalPrice, spread);

      cexOrders.push({
        price: ask,
        amount,
        side: 'sell',
        pair: this.pair
      });

      cexOrders.push({
        price: bid,
        amount,
        side: 'buy',
        pair: this.pair
      });
    });

    return cexOrders;
  }

  calculatePrices(internalPrice, externalPrice, spreadInPercent) {
    const spread = spreadInPercent / 100;
    if (externalPrice.mid > internalPrice.mid) {
      let bidSpreadPrice = externalPrice.mid * (1 - spread / 2);

      if (bidSpreadPrice > internalPrice.mid) {
        return {
          ask: internalPrice.mid * (1 + spread / 2),
          bid: internalPrice.mid * (1 - spread / 2)
        }
      }

      return {
        ask: externalPrice.mid * (1 + spread / 2),
        bid: bidSpreadPrice
      }
    } else {
      let askSpreadPrice = externalPrice.mid * (1 + spread / 2);

      if (askSpreadPrice < internalPrice.mid) {
        return {
          ask: internalPrice.mid * (1 + spread / 2),
          bid: internalPrice.mid * (1 - spread / 2)
        }
      }

      return {
        ask: askSpreadPrice,
        bid: externalPrice.mid * (1 - spread / 2)
      }
    }
  }

  calculatePricesOnlyInternal(internalPrice, spreadInPercent) {
    const spread = spreadInPercent / 100;

    console.log(`Internal price: ${internalPrice.mid}`);
    return {
      ask: internalPrice.mid * (1 + spread / 2),
      bid: internalPrice.mid * (1 - spread / 2)
    }
  }

  calcSpreadPrice(midPrice, spread) {
    return midPrice * (1 - spread / 2);
  }
}

module.exports = SpreadOrders;