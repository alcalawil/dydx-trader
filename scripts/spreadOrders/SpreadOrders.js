class SpreadOrders {
  constructor(range) {
    this.range = range;
  }

  outputOrders(marketData) {
    const { internalPrice, externalPrice } = marketData;
  

    return this.range.map(({ spread, amount }) => {
      const { ask, bid } = this.calculatePrices(internalPrice, externalPrice, spread);

      return {
        ask: {
          price: ask,
          amount,
          side: 'sell'
        },
        bid: {
          price: bid,
          amount,
          side: 'buy'
        }
      }
    });
  }

  calculatePrices(internalPrice, externalPrice, spread) {
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

  calcSpreadPrice(midPrice, spread) {
    return midPrice * (1 - spread / 2);
  }
}

module.exports = SpreadOrders;