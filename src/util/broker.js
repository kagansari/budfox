const ccxt = require('ccxt')
const Candle = require('./Candle')

const exchanges = {} // ccxt instances

exports.init = async (exchangeName) => {
  // create ccxt instance
  exchanges[exchangeName] = new ccxt[exchangeName]({
    enableRateLimit: true
  })
  // load markets for all exchanges
  await exchanges[exchangeName].loadMarkets()
  console.log(`Markets loaded: ${exchangeName}`) // eslint-disable-line no-console
}

/**
 * fills given dataset from ccxt and returns it
 * @param {Dataset} dataset
 * @return {Dataset}
 */
exports.fillDataset = async (dataset) => {
  const rawCandles = await exchanges[dataset.exchange].fetchOHLCV(dataset.symbol, '1m', dataset.from, dataset.length)
  const candles = rawCandles.map(r => new Candle(r))
  return dataset.setCandles(candles)
}

exports.exchanges = exchanges
