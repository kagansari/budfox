require('dotenv').config() // load environment variables first

const yargs = require('yargs')
const moment = require('moment')
const debug = require('debug')

const util = require('./util')
const Importer = require('./providers/importer')
const Backtest = require('./providers/backtest')
const Saver = require('./executors/saver')
const Advisor = require('./executors/advisor')
const server = require('./server')

// to show logs in vscode
debug.log = console.log.bind(console) // eslint-disable-line no-console

const { broker, db } = util

const argv = yargs.options({
  mode: {
    alias: 'm',
    describe: 'What u gonna do?',
    choices: ['ui', 'import', 'backtest', 'explore'],
    default: 'ui'
  },
  exchange: {
    type: 'string',
    describe: 'Exchange name',
    default: 'binance'
  },
  symbol: {
    type: 'string',
    describe: 'BASE_CURRENCY/QUOTE_CURRENCY',
    default: 'BTC/USDT'
  },
  from: {
    describe: 'ISO string or timestamp of starting time',
    default: () => {
      return moment().minute(0).millisecond(0).subtract(1, 'months').toISOString()
    }
  },
  to: {
    describe: 'ISO string or timestamp of starting time',
    default: () => {
      return moment().minute(0).millisecond(0).toISOString()
    }
  }
}).argv

const start = async () => {
  switch (argv.mode) {
    case 'ui':
      await Promise.all([broker.init(argv.exchange), db.init()]) // init markets and db
      server.start()
      break
    case 'import': {
      await Promise.all([broker.init(argv.exchange), db.init()]) // init markets and db
      const { exchange, symbol } = argv
      const from = moment(argv.from).valueOf()
      const to = moment(argv.to).valueOf()
      startImporter(exchange, symbol, from, to)
      break
    }
    case 'explore':
      await Promise.all([broker.init(argv.exchange), db.init()]) // init markets and db
      db.exploreDatasets().then(end)
      break
    case 'backtest': {
      await db.init() // init only db
      const { exchange, symbol } = argv
      const from = moment(argv.from).valueOf()
      const to = moment(argv.to).valueOf()
      startBacktest(exchange, symbol, from, to)
      break
    }
    default:
      throw new Error('Invalid mode')
  }
}

const end = () => {
  db.close()
}

/**
 * @param {String} exchange
 * @param {String} symbol
 * @param {Number} from
 * @param {Number} to
 */
const startImporter = async (exchange, symbol, from, to) => {
  const importer = new Importer(exchange, symbol, from, to)
  const saver = new Saver()
  await importer.pipe(saver).on('finish', end)
}


/**
 * @param {String} exchange
 * @param {String} symbol
 * @param {Number} from
 * @param {Number} to
 */
const startBacktest = (exchange, symbol, from, to) => {
  const advisor = new Advisor()
  const backtest = new Backtest(exchange, symbol, from, to)
  backtest.pipe(advisor).on('finish', end)
}

start()
