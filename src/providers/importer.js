const { Readable } = require('stream')
const moment = require('moment')
const debug = require('debug')('bs:import')
const { broker } = require('../util')

class Importer extends Readable {
  /**
   * @param {String} exchange binance
   * @param {String} symbol BTC/USDT
   * @param {Number} from unix timestamp
   * @param {Number} to unix timestamp
   */
  constructor(exchange, symbol, from, to) {
    super({ objectMode: true })
    this.exchange = exchange
    this.symbol = symbol
    this.from = from
    this.to = to
    this.current = from
  }

  /**
   * @return {Number} completed percentage
   */
  getProgress() {
    const progress = (this.current - this.from) / (this.to - this.from)
    return Math.ceil(progress * 100)
  }

  /**
   * @param {[Array]} candles [[timestamp, O, H, L, C, V]]
   */
  handleCandles(candles) {
    if (candles.length === 0) {
      debug('No candle returned, aborting')
      return this.push(null)
    }
    // ends of fetched data (timestamps)
    const start = candles[0][0]
    const end = candles[candles.length - 1][0]

    // check if timestamps of fetched data are correct
    const expectedCount = ((end - start) / 60000) + 1
    if (expectedCount !== candles.length) {
      const err = new Error(`Looks like data has missing points, has ${candles.length} but looks ${expectedCount}`)
      // this.emit('error', err) // @todo handle error
      console.error(err) // eslint-disable-line no-console
      this.push(null)
      return
    }

    // if incoming data starts after from the start parameter
    if (start > this.current + 60000) {
      this.from = start
      debug(`No available data, starting from ${moment(start).toISOString()}`)
    }

    this.current = end + 60000 // start from the next minute
    debug(`Fetched ${candles.length} candles from ${moment(start).toISOString()} to ${moment(end).toISOString()}, ${this.getProgress()}% completed`);
    this.push({
      exchange: this.exchange,
      symbol: this.symbol,
      candles
    })
  }

  _read() {
    if (this.current >= this.to) {
      debug('Importing done')
      return this.push(null)
    }
    // if this is the last step
    const leftCandleCount = Math.floor((this.to - this.current) / 60000)
    const limit = Math.min(500, leftCandleCount)

    broker.getCandles(this.exchange, this.symbol, this.current, limit)
    .then(this.handleCandles.bind(this))
  }
}

module.exports = Importer;
