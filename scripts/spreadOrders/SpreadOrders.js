class SpreadOrders {
  constructor(range, pair, { useExternalPrice }) {
    this.range = range;
    this.pair = pair;
    this.useExternalPrice = useExternalPrice
  }

  outputOrders(marketData) {
    const { internalPrice, externalPrice } = marketData;
    const cexOrders = [];

    this.range.map((options) => {
      const { ask, bid } = this.useExternalPrice 
      ? this.calculatePrices(internalPrice, externalPrice, options.ask, options.bid)
      : this.calculatePricesOnlyInternal(internalPrice, options.ask, options.bid);

      cexOrders.push({
        price: ask,
        amount: options.ask.amount,
        side: 'sell',
        pair: this.pair
      });

      cexOrders.push({
        price: bid,
        amount: options.bid.amount,
        side: 'buy',
        pair: this.pair
      });
    });

    return cexOrders;
  }

  calculatePrices(internalPrice, externalPrice, askOptions, bidOptions) {
    const askSpread = askOptions.spread / 100;
    const bidSpread = bidOptions.spread / 100;

    if (externalPrice.mid > internalPrice.mid) {
      let bidSpreadPrice = externalPrice.mid * (1 - bidSpread / 2);

      if (bidSpreadPrice > internalPrice.mid) {
        return {
          ask: internalPrice.mid * (1 + askSpread / 2),
          bid: internalPrice.mid * (1 - bidSpread / 2)
        }
      }

      return {
        ask: externalPrice.mid * (1 + askSpread / 2),
        bid: bidSpreadPrice
      }
    } else {
      let askSpreadPrice = externalPrice.mid * (1 + askSpread / 2);

      if (askSpreadPrice < internalPrice.mid) {
        return {
          ask: internalPrice.mid * (1 + askSpread / 2),
          bid: internalPrice.mid * (1 - bidSpread / 2)
        }
      }

      return {
        ask: askSpreadPrice,
        bid: externalPrice.mid * (1 - bidSpread / 2)
      }
    }
  }

  calculatePricesOnlyInternal(internalPrice, askOptions, bidOptions) {
    const askSpread = askOptions.spread / 100;
    const bidSpread = bidOptions.spread / 100;
    console.log(`Internal price: ${internalPrice.mid}`);
    return {
      ask: internalPrice.mid * (1 + askSpread / 2),
      bid: internalPrice.mid * (1 - bidSpread / 2)
    }
  }

  calcSpreadPrice(midPrice, spread) {
    return midPrice * (1 - spread / 2);
  }
}

module.exports = SpreadOrders;