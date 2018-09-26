const { Writable } = require('stream')
const { Indicators } = require('../util')

class Advisor extends Writable {
  constructor() {
    super({ objectMode: true })
    this.indicators = new Indicators()
  }

  _write(data, encoding, next) {
    this.indicators.update(data)
    next()
  }
}

module.exports = Advisor
