const { Writable } = require('stream')
const Importer = require('../../src/providers/Importer')
const { Candle, Dataset } = require('../../src/util')
const broker = require('../../src/util/broker')

jest.mock('../../src/util/broker')

broker.fillDataset.mockImplementation(async (dataset) => {
  // 15 candles
  const rawData = [
    [1533463200000.0, 7067.59, 7070, 7060.52, 7066.2, 31.954776],
    [1533463260000.0, 7066.2, 7077.74, 7066.2, 7077.74, 44.956988],
    [1533463320000.0, 7072.36, 7082.54, 7072.36, 7078.06, 49.029872],
    [1533463380000.0, 7078.07, 7078.43, 7075.41, 7078, 42.231384],
    [1533463440000.0, 7076.01, 7080.01, 7076.01, 7080.01, 93.10206],
    [1533463500000.0, 7078.94, 7089.87, 7078.94, 7083.73, 22.520387],
    [1533463560000.0, 7083.73, 7083.81, 7071, 7077.2, 31.903912],
    [1533463620000.0, 7078, 7079.94, 7068.43, 7068.43, 46.971676],
    [1533463680000.0, 7068.83, 7076.85, 7068.83, 7072.5, 22.008863],
    [1533463740000.0, 7072.51, 7073.86, 7066, 7066.12, 21.569248],
    // 10
    [1533463800000.0, 7066.12, 7069.15, 7066, 7066.17, 7.718213],
    [1533463860000.0, 7068.99, 7072.18, 7066.17, 7067.69, 41.476141],
    [1533463920000.0, 7067.57, 7068.98, 7059.33, 7060.52, 64.07759],
    [1533463980000.0, 7063.11, 7063.11, 7050, 7050, 15.622217],
    [1533464040000.0, 7050, 7051.99, 7045.34, 7046.99, 12.636306]
  ]

  const candles = rawData.map(d => new Candle(d))
  const startIndex = candles.findIndex(c => c.ts == dataset.from)
  const slicedCandles = candles.slice(startIndex, startIndex + dataset.length)

  return dataset.setCandles(slicedCandles)
})

const mockWriter = new Writable({
  objectMode: true,
  write: (data, encoding, next) => next()
})

test('Streams candle data', (done) => {
  const dataset = new Dataset({
    exchange: 'binance',
    symbol: 'BTC/USDT',
    from: 1533463200000,
    to: 1533464040000
  })
  const importer = new Importer(dataset)
  importer.maxLimit = 10

  const onData = jest.fn()

  importer.on('data', onData)

  importer.pipe(mockWriter)
  .on('finish', () => {
    expect(onData).toBeCalledTimes(2)
    done()
  })
  .on('error', e => { throw e })
})