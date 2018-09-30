const { Readable } = require('stream')
const debug = require('debug')('bs:backtest')
const { db } = require('../util')

class Backtest extends Readable {
  /**
   * @param {Dataset} dataset
   */
  constructor(dataset) {
    super({ objectMode: true })
    this.dataset = dataset
    this.iterator = db.getItarator(dataset)
    this.lastTS = dataset.from - 60000
  }

  /**
   * @return {Number} completed percentage
   */
  getProgress() {
    const progress = (this.lastTS - this.dataset.from) / (this.dataset.to - this.dataset.from)
    return Math.ceil(progress * 100)
  }

  _read() {
    this.iterator.next()
      .then(nextCandle => {
        this.lastTS = nextCandle.ts
        this.push(nextCandle)
      }).catch(e => {
        debug(e)
        this.push(null)
      })
  }
}

module.exports = Backtest
