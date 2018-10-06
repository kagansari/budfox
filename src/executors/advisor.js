const { Writable } = require('stream')
const { Indicators } = require('../util')

class Advisor extends Writable {
  constructor() {
    super({ objectMode: true })
    this.indicators = new Indicators()
  }

  /**
   * @param {Candle} candle
   */
  _write(candle, encoding, next) {
    this.indicators.update(candle)
    next()
  }

  _final(cb) {
    console.log(this.indicators);
    // cb()
  }
}

module.exports = Advisor
