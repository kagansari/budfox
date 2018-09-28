const moment = require('moment')

class Candle {
  /**
   * @param  {...any} args
   * new Candle(ts, o, h, l, c, v)
   * new Candle(ts, o, h, l, c)
   * new Candle([ts, o, h, l, c])
   * new Candle({ ts, o, h, l, c })
   */
  constructor(...args) {
    let params
    if (args[0] instanceof Array) { // as params
      const [ts, o, h, l, c, v] = args[0]
      params = { ts, o, h, l, c, v }
    } else if (args.length >= 5) { // as raw data
      const [ts, o, h, l, c, v] = args
      params = { ts, o, h, l, c, v }
    } else if (args[0]._id) { // mongo document
      const [ts, o, h, l, c, v] = args[0].data
      params = { ts, o, h, l, c, v }
    } else if (args[0] instanceof Object) {
      params = args[0]
    }

    Object.assign(this, params)
  }

  getRaw() {
    return [this.ts, this.o, this.h, this.l, this.c, this.v]
  }

  // get mongodb object
  getDocument() {
    return {
      _id: this.ts,
      data: this.getRaw()
    }
  }

  toString() {
    return moment(this.ts)
  }
}

module.exports = Candle
