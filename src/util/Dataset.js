const Candle = require('./Candle')
const moment = require('moment')

class Dataset {
  /**
   * @param {Object} options
   * {
   *  exchange: String,
   *  symbol: String,
   *  from: Number,
   *  to: Number,
   *  raw: [[TS, O, H, L, C, V]]
   *  candles: [Candle]
   * }
   */
  constructor(options) {
    const { exchange, symbol, from, to, raw, candles } = options
    // mandatory fields
    if (!exchange || !symbol) {
      throw new Error('Exchange and symbol required')
    }
    // meta data only, no candle
    this.exchange = exchange
    this.symbol = symbol
    if (from && to) {
      this.from = from
      this.to = to
    }
    if (raw) {
      this.from = raw[0][0]
      this.to = raw[raw.length - 1][0]
      this.candles = raw.map(r => new Candle(r))
    }
    if (candles) {
      this.from = candles[0].ts
      this.to = candles[candles.length - 1].ts
      this.candles = candles
    }
  }

  async load() {}

  get collectionName() {
    const [base, quote] = this.symbol.split('/')
    return `candles_${this.exchange}_${base}_${quote}`
  }

  get length() {
    return (this.to - this.from) / 60000 + 1
  }

  isLoaded() {
    return Boolean(this.candles && this.candles.length === this.length)
  }

  /**
   * @param {[Candle]} candles
   */
  setCandles(candles) {
    if (candles.length !== this.length) {
      throw new Error(`Expected ${this.length} candles but ${candles.length} found`)
    }
    if (candles[0].ts !== this.from) {
      throw new Error(`Invalid start date`)
    }
    if (candles[candles.length - 1].ts !== this.to) {
      throw new Error(`Invalid start date`)
    }
    this.candles = candles
    return this
  }

  toString() {
    const fromStr = moment(this.from).toISOString()
    const toStr = moment(this.to).toISOString()
    const durationStr = moment.duration(moment(this.from).diff(this.to)).humanize()
    const loadedStr = this.isLoaded() ? 'Loaded' : 'Not loaded'
    return `${this.exchange}:${this.symbol}: From(${fromStr}) To(${toStr}) : ${this.length} candles (${loadedStr}), ${durationStr}`
  }

  toJSON() {
    return {
      exchange: this.exchange,
      symbol: this.symbol,
      from: this.from,
      to: this.to
    }
  }
}

module.exports = Dataset