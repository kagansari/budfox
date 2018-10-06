// @todo get config from constructor parameter
const configs = [
  {
    type: 'SMA',
    period: 26
  }, {
    type: 'SMA',
    period: 12
  }, {
    type: 'SMA',
    period: 7
  }, {
    type: 'SMA',
    period: 14
  }, {
    type: 'EMA',
    period: 26
  }, {
    type: 'EMA',
    period: 12
  }, {
    type: 'EMA',
    period: 7
  }, {
    type: 'EMA',
    period: 14
  }, {
    type: 'MACD',
    longPeriod: 26,
    shortPeriod: 12,
    signalPeriod: 9
  }, {
    type: 'CCI',
    period: 14
  }
]

class Indicators {
  constructor() {
    this.previousCandles = [] // in case if needed
    // this.period = 14
    // this.periods = config.periods
    this.SMA = {} // simple moving average
    this.EMA = {} // exponential moving average
    this.MACD = {} // moving average convergence divergence
    this.CCI = {} // commodity channel index
    // this.RSI = {} // relative strength index
    // this.PSAR = {} // parabolic sar
    // this.BB = {} // bollinger bands
    // this.PPO = {} // ?
    // this.DEMA = {} // ?
    // this.TSI = {} // ?
    // this.UO = {} // ?
  }

  updateSMA(candle, period) {
    const candles = this.getLastCandles(period)
    let sum = 0
    for (candle of candles) {
      sum += candle.o
    }
    this.SMA[period] = sum / candles.length
  }

  updateEMA(candle, period) {
    if (this.previousCandles.length < period) {
      return
    }
    const multiplier = 2 / (period + 1)
    if (!this.EMA[period]) {
      this.EMA[period] = this.SMA[period]
    }

    this.EMA[period] = (candle.o - this.EMA[period]) * multiplier + this.EMA[period]
  }

  updateMACD(candle, macdConfig) {
    if (this.previousCandles.length < macdConfig.longPeriod) {
      return
    }
    const { shortPeriod, longPeriod, signalPeriod } = macdConfig
    const macd = this.EMA[shortPeriod] - this.EMA[longPeriod]
    // EMA of MACD
    const multiplier = 2 / (signalPeriod + 1)
    if (!macdConfig.signal) {
      macdConfig.signal = macd
    }
    macdConfig.signal = (macd - macdConfig.signal) * multiplier + macdConfig.signal
    this.MACD[`${longPeriod}_${shortPeriod}_${signalPeriod}`] = {
      value: macd,
      signal: macdConfig.signal,
      histogram: macd - macdConfig.signal
    }
    // MACD = EMA(shortPeriod) - EMA(longPeriod)
    // Signal: EMA(signalPeriod) of MACD Line
    // MACD Histogram: MACD Line - Signal Line
  }

  updateCCI(candle, period) {
    if (this.previousCandles.length < period) {
      return
    }
    const lastCandles = this.getLastCandles(period)
    const tp = (candle.o + candle.l + candle.c) / 3
    const tps = lastCandles.map(c => (c.o + c.l + c.c) / 3)

    const tpMean = tps.reduce((sum, tp) => sum += tp, 0) / tps.length
    const tpMeanDeviation = tps.reduce((sum, tp) => sum += Math.abs(tpMean - tp), 0) / tps.length

    this.CCI[period] = (tp - tpMean) / (.015 * tpMeanDeviation)
    // Typical Price (TP) = (High + Low + Close)/3
    // CCI = (Typical Price  -  SMA(period) of TP) / (.015 x Mean Deviation)
    // Constant = .015
  }

  /**
   * @return {Object} { value, signal }
   */
  getMACD(longPeriod, shortPeriod, signalPeriod) {
    return this.MACD[`${longPeriod}_${shortPeriod}_${signalPeriod}`]
  }

  getLastCandles(period) {
    const start = Math.max(0, this.previousCandles.length - period)
    return this.previousCandles.slice(start)
  }

  update(candle) {
    if (this.previousCandles.length >= 26) {
      this.previousCandles.shift()
    }
    this.previousCandles.push(candle)

    for (const config of configs) {
      switch (config.type) {
        case 'SMA':
          this.updateSMA(candle, config.period)
          break;
        case 'EMA':
          this.updateEMA(candle, config.period)
          break;
        case 'MACD':
          this.updateMACD(candle, config)
          break;
        case 'CCI':
          this.updateCCI(candle, config.period)
          break;
        default:
          break;
      }
    }
  }
}

module.exports = Indicators
