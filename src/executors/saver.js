const { Writable } = require('stream')
const { db } = require('../util')

class Saver extends Writable {
  constructor() {
    super({ objectMode: true })
  }

  /**
   * @param {Object} data { exchange: String, symbol: String, candles: [TS,O,H,L,C,V]}
   */
  _write(data, encoding, next) {
    const { exchange, symbol, candles } = data
    db.saveCandles(exchange, symbol, candles)
    .then(next);
  }
}

module.exports = Saver
