const { Writable } = require('stream')
const { db } = require('../util')

class Saver extends Writable {
  constructor() {
    super({ objectMode: true })
  }

  /**
   * @param {Dataset} data
   */
  _write(dataset, encoding, next) {
    db.saveDataset(dataset).then(next);
  }
}

module.exports = Saver
