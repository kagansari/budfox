const { Readable } = require('stream')
const debug = require('debug')('bs:backtest')
const util = require('../util')

class Backtest extends Readable {
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

  async getCursor() {
    if (this.cursor) return this.cursor
    this.cursor = await util.db.getCandleCursor(this.exchange, this.symbol, this.from, this.to)

    if (this.cursor) {
      return this.cursor
    } else {
      debug('Data not available')
      this.emit('error', new Error('Data not available'))
    }
  }

  // check and push next candle from db
  async readData() {
    const cursor = await this.getCursor()
    if (await cursor.hasNext()) {
      const nextCandle = await this.cursor.next()
      this.current = nextCandle._id
      this.push(nextCandle)
    } else {
      debug('Data over, closing')
      this.push(null)
    }
  }

  _read() {
    this.readData()
  }
}

module.exports = Backtest
