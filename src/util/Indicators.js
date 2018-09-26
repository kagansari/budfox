// @todo get config from constructor parameter
const config = {
  ema: {
    periods: [30, 60, 180]
  }
}

class Indicators {
  constructor() {
    // this.previousCandles = [] // in case if needed
    this.config = config
    this.ema = {}
  }

  updateEMA(candle) {
    for (const period of this.config.ema.periods) {
      const multiplier = 2 / (period + 1)
      if (!this.ema[period]) {
        this.ema[period] = candle.data[4]
      }
      this.ema[period] = (candle.data[4] - this.ema[period]) * multiplier + this.ema[period]
    }
  }

  update(candle) {
    // if (this.previousCandles.length >= this.period) {
    //   this.previousCandles.shift()
    // }
    // this.previousCandles.push(candle)

    this.updateEMA(candle)
  }

}

module.exports = Indicators
