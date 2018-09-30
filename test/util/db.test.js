require('dotenv').config()

const { db, Dataset } = require('../../src/util')

process.env.MONGO_DB = 'candles_test' // override database name

beforeAll(async () => {
  await db.init()
  await db.reset()
})

beforeEach(async () => {
  await db.reset()
})

test('Saves candles to db and fetch later on', async () => {
  // 15 candles
  const exchange = 'binance'
  const symbol = 'BTC/USDT'
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
    [1533463740000.0, 7072.51, 7073.86, 7066, 7066.12, 21.569248],
    // 10
    [1533463800000.0, 7066.12, 7069.15, 7066, 7066.17, 7.718213],
    [1533463860000.0, 7068.99, 7072.18, 7066.17, 7067.69, 41.476141],
    [1533463920000.0, 7067.57, 7068.98, 7059.33, 7060.52, 64.07759],
    [1533463980000.0, 7063.11, 7063.11, 7050, 7050, 15.622217],
    [1533464040000.0, 7050, 7051.99, 7045.34, 7046.99, 12.636306]
  ]
  const dataset = new Dataset({ exchange, symbol, raw })
  await db.saveDataset(dataset)

  const unloadedDataset = new Dataset({ exchange, symbol, from: dataset.from, to: dataset.to })
  await expect(db.fillDataset(unloadedDataset)).resolves.toBeDefined()

  // data has missing points
  const errorDataset = new Dataset({ exchange, symbol, from: dataset.from, to: 1533465040000 })
  await expect(db.fillDataset(errorDataset)).rejects.toThrowError()
  // // undefined dataset
  let undefinedDataset = new Dataset({ exchange: 'notanexhange', symbol, from: dataset.from, to: dataset.to })
  await expect(db.fillDataset(undefinedDataset)).rejects.toThrowError()
  undefinedDataset = new Dataset({ exchange, symbol: 'BOK/USDT', from: dataset.from, to: dataset.to })
  await expect(db.fillDataset(undefinedDataset)).rejects.toThrowError()
})

test('Explores datasets', async () => {
  const btc1 = new Dataset({
    exchange: 'binance',
    symbol: 'BTC/USDT',
    raw:[
      [1533463200000.0, 7067.59, 7070, 7060.52, 7066.2, 31.954776],
      [1533463260000.0, 7066.2, 7077.74, 7066.2, 7077.74, 44.956988],
      [1533463320000.0, 7072.36, 7082.54, 7072.36, 7078.06, 49.029872],
      [1533463380000.0, 7078.07, 7078.43, 7075.41, 7078, 42.231384],
      [1533463440000.0, 7076.01, 7080.01, 7076.01, 7080.01, 93.10206],
      [1533463500000.0, 7078.94, 7089.87, 7078.94, 7083.73, 22.520387],
      [1533463560000.0, 7083.73, 7083.81, 7071, 7077.2, 31.903912]
    ]
  })
  const btc2 = new Dataset({
    exchange: 'binance',
    symbol: 'BTC/USDT',
    raw: [
      [1533463800000.0, 7066.12, 7069.15, 7066, 7066.17, 7.718213],
      [1533463860000.0, 7068.99, 7072.18, 7066.17, 7067.69, 41.476141],
      [1533463920000.0, 7067.57, 7068.98, 7059.33, 7060.52, 64.07759],
      [1533463980000.0, 7063.11, 7063.11, 7050, 7050, 15.622217],
      [1533464040000.0, 7050, 7051.99, 7045.34, 7046.99, 12.636306]
    ]
  })

  const eth1 = new Dataset({
    exchange: 'binance',
    symbol: 'ETH/USDT',
    raw: [
      [1533463320000.0, 7072.36, 7082.54, 7072.36, 7078.06, 49.029872],
      [1533463380000.0, 7078.07, 7078.43, 7075.41, 7078, 42.231384],
      [1533463440000.0, 7076.01, 7080.01, 7076.01, 7080.01, 93.10206],
      [1533463500000.0, 7078.94, 7089.87, 7078.94, 7083.73, 22.520387],
      [1533463560000.0, 7083.73, 7083.81, 7071, 7077.2, 31.903912],
      [1533463620000.0, 7078, 7079.94, 7068.43, 7068.43, 46.971676],
      [1533463680000.0, 7068.83, 7076.85, 7068.83, 7072.5, 22.008863],
      [1533463740000.0, 7072.51, 7073.86, 7066, 7066.12, 21.569248],
      [1533463800000.0, 7066.12, 7069.15, 7066, 7066.17, 7.718213],
      [1533463860000.0, 7068.99, 7072.18, 7066.17, 7067.69, 41.476141],
      [1533463920000.0, 7067.57, 7068.98, 7059.33, 7060.52, 64.07759],
      [1533463980000.0, 7063.11, 7063.11, 7050, 7050, 15.622217]
    ]
  })
  for (const dataset of [btc1, btc2, eth1]) {
    await db.saveDataset(dataset)
  }

  const datasets = (await db.exploreDatasets()).map(d => d.toJSON())
  const expectedDatasets = [btc1, btc2, eth1].map(d => d.toJSON());

  expect(datasets).toHaveLength(expectedDatasets.length)
  for (const dataset of datasets) {
    expect(expectedDatasets).toContainEqual(dataset)
  }
})

afterAll(async () => {
  await db.close()
})