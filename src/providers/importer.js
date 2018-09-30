const { Readable } = require('stream')
const debug = require('debug')('bs:import')
const { broker, Dataset } = require('../util')

class Importer extends Readable {
  /**
   * @param {Dataset} dataset
   */
  constructor(dataset) {
    super({ objectMode: true })
    this.dataset = dataset
    this.lastTS = dataset.from - 60000 // timestamp of the latest candle pushed
    this.maxLimit = 500 // maximum chunk size
  }

  /**
   * @return {Number} completed percentage
   */
  getProgress() {
    const progress = (this.lastTS - this.dataset.from) / (this.dataset.to - this.dataset.from)
    return Math.ceil(progress * 100)
  }

  /**
   * @param {Dataset} dataset
   */
  handleDataset(dataset) {
    if (dataset.length === 0) {
      debug('No candle returned, aborting')
      return this.push(null)
    }

    debug(`Fetched data: ${dataset}, ${this.getProgress()}% completed`);
    this.lastTS = dataset.to // start from the next minute
    this.push(dataset)
  }

  _read() {
    if (this.lastTS >= this.dataset.to) {
      debug('Importing done')
      return this.push(null)
    }

    const nextDataset = new Dataset({
      exchange: this.dataset.exchange,
      symbol: this.dataset.symbol,
      from: this.lastTS + 60000 || this.dataset.from,
      to: Math.min(this.lastTS + this.maxLimit * 60000, this.dataset.to)
    })

    broker
      .fillDataset(nextDataset)
      .then(this.handleDataset.bind(this))
  }
}

module.exports = Importer;
