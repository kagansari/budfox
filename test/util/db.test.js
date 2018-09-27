require('dotenv').config()

const { db } = require('../../src/util')
const mockDatasets = require('../mock/datasets')

process.env.MONGO_DB = 'candles_test' // override database name

beforeAll(async () => {
  await db.init()
  await db.reset()
})

beforeEach(async () => {
  await db.reset()
})

test('Saves candles to db and fetch later on', async () => {
  for (const mockDataset of mockDatasets) {
    const { exchange, symbol, data } = mockDataset
    await db.saveCandles(exchange, symbol, data.map(d => d.data))
  }
  const datasetBTC1 = mockDatasets[0]
  const datasetBTC2 = mockDatasets[1]
  // partial data
  await expect(db.getDataset(datasetBTC1.exchange, datasetBTC1.symbol, datasetBTC1.from, datasetBTC1.to)).resolves.toBeDefined()
  // data has missing points
  await expect(db.getDataset(datasetBTC1.exchange, datasetBTC1.symbol, datasetBTC1.from, datasetBTC2.to)).rejects.toThrowError()
  // // undefined dataset
  await expect(db.getDataset('notanexhange', datasetBTC1.symbol, datasetBTC1.from, datasetBTC1.to)).rejects.toThrowError()
  await expect(db.getDataset(datasetBTC1.exchange, 'BOK/USDT', datasetBTC1, datasetBTC1)).rejects.toThrowError()
})

test('Explores datasets', async () => {
  const expectedDatasets = [];
  for (const mockDataset of mockDatasets) {
    const { exchange, symbol, data, from, to } = mockDataset
    await db.saveCandles(exchange, symbol, data.map(d => d.data))
    expectedDatasets.push({ exchange, symbol, from, to })
  }
  const datasets = await db.exploreDatasets()

  expect(datasets).toHaveLength(expectedDatasets.length)
  for (const dataset of datasets) {
    expect(expectedDatasets).toContainEqual(dataset)
  }
})

afterAll(async () => {
  await db.close()
})