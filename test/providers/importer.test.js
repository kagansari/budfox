const { Writable } = require('stream')
const Importer = require('../../src/providers/Importer')
const mockDatasets = require('../mock/datasets')

jest.mock('../../src/util', () => ({
  broker: {
    getCandles: jest.fn((exchange, symbol, since, limit) => {
      const dataArr = mockDatasets[0].data.map(d => d.data)
      const startIndex = dataArr.findIndex(data => data[0] == since)
      return Promise.resolve(dataArr.slice(startIndex, startIndex + limit))
    })
  }
}))

const writer = new Writable({
  objectMode: true,
  write: (data, encoding, next) => next()
})

test('Streams candle data', (done) => {
  const dataset = mockDatasets[0] // btc data
  const { exchange, symbol, from, to } = dataset

  const importer = new Importer(exchange, symbol, from, to)
  importer.maxLimit = 10

  const onData = jest.fn()

  importer.on('data', onData)

  importer.pipe(writer)
  .on('finish', () => {
    expect(onData.mock.calls.length).toBe(3)
    expect(onData.mock.calls[2][0].candles).toHaveLength(dataset.data.length % 10)
    done()
  })
  .on('error', e => { throw e })
})