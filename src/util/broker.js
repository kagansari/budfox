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

exports.getCandles = async (exchangeName, symbol, since, limit=500) => {
  if (!exchanges[exchangeName]) {
    exchanges[exchangeName] = new ccxt[exchangeName]({
      enableRateLimit: true
    })
  }
  const rawCandles = await exchanges[exchangeName].fetchOHLCV(symbol, '1m', since, limit)
  return rawCandles.map(c => new Candle(c))
}

exports.exchanges = exchanges
