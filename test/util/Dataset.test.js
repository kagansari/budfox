const { Dataset, Candle } = require('../../src/util')

const exchange = 'binance'
const symbol = 'BTC/USDT'
const collectionName = 'candles_binance_BTC_USDT'
const from = 1533463200000
const to = 1533463740000

const raw = [
  [1533463200000.0, 7067.59, 7070, 7060.52, 7066.2, 31.954776],
  [1533463260000.0, 7066.2, 7077.74, 7066.2, 7077.74, 44.956988],
  [1533463320000.0, 7072.36, 7082.54, 7072.36, 7078.06, 49.029872],
  [1533463380000.0, 7078.07, 7078.43, 7075.41, 7078, 42.231384],
  [1533463440000.0, 7076.01, 7080.01, 7076.01, 7080.01, 93.10206],
  [1533463500000.0, 7078.94, 7089.87, 7078.94, 7083.73, 22.520387],
  [1533463560000.0, 7083.73, 7083.81, 7071, 7077.2, 31.903912],
  [1533463620000.0, 7078, 7079.94, 7068.43, 7068.43, 46.971676],
  [1533463680000.0, 7068.83, 7076.85, 7068.83, 7072.5, 22.008863],
  [1533463740000.0, 7072.51, 7073.86, 7066, 7066.12, 21.569248]
]

const candles = raw.map(r => new Candle(r))

test('constructs from raw', () => {
  const ds = new Dataset({ exchange, symbol, raw }) // raw data
  expect(ds.isLoaded()).toBe(true)
  expect(ds.length).toBe(raw.length)
  expect(ds.candles).toHaveLength(raw.length)
})

test('constructs from candles', () => {
  const ds = new Dataset({ exchange, symbol, candles }) // raw data
  expect(ds.isLoaded()).toBe(true)
  expect(ds.candles).toHaveLength(raw.length)
  expect(ds.length).toEqual(raw.length)
})

test('constructs from meta info', () => {
  const ds = new Dataset({ exchange, symbol, from, to }) // raw data
  expect(ds.isLoaded()).toBe(false)
  expect(ds.length).toBe(raw.length)
  expect(ds.collectionName).toBe(collectionName)
})

test('set candles', () => {
  const ds = new Dataset({ exchange, symbol, from, to })
  ds.setCandles(candles)
  expect(ds.candles).toHaveLength(raw.length)
  expect(ds.setCandles.bind(ds, candles.slice(0, 4))).toThrowError()
})

// test('throws on setting invalid candles', () => {
// })
