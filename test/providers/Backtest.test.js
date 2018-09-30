const { Writable } = require('stream')
const Backtest = require('../../src/providers/Backtest')
const { db, Candle, Dataset } = require('../../src/util')

jest.mock('../../src/util/db')

const rawData = [
  [1533463200000.0, 7067.59, 7070, 7060.52, 7066.2, 31.954776],
  [1533463260000.0, 7066.2, 7077.74, 7066.2, 7077.74, 44.956988],
  [1533463320000.0, 7072.36, 7082.54, 7072.36, 7078.06, 49.029872],
  [1533463380000.0, 7078.07, 7078.43, 7075.41, 7078, 42.231384],
  [1533463440000.0, 7076.01, 7080.01, 7076.01, 7080.01, 93.10206],
  [1533463500000.0, 7078.94, 7089.87, 7078.94, 7083.73, 22.520387],
  [1533463560000.0, 7083.73, 7083.81, 7071, 7077.2, 31.903912]
]

db.getItarator.mockImplementation(() => {
  // 15 candles
  let index = -1
  const next = async () => {
    index = index + 1
    return new Candle(rawData[index])
  }

  return { next }
})

const write = jest.fn((data, encoding, next) => next())
const mockWriter = new Writable({
  objectMode: true,
  write
})

test('Streams candle data', (done) => {
  const dataset = new Dataset({
    exchange: 'binance',
    symbol: 'BTC/USDT',
    from: 1533463200000,
    to: 1533463560000
  })
  const backtest = new Backtest(dataset)

  backtest.pipe(mockWriter)
  .on('finish', () => {
    expect(write).toBeCalledTimes(rawData.length)
    expect(write.mock.calls[0][0].getRaw()).toEqual(rawData[0])
    done()
  })
  .on('error', e => { throw e })
})