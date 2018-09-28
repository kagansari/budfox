const Candle = require('../../src/util/Candle')

const ts = 1533463200000
const o = 7067.59
const h = 7070
const l = 7060.52
const c = 7066.2
const v = 31.954776

const raw = [ts ,o ,h ,l ,c ,v]

test('constructor', () => {
  const candle1 = new Candle(raw) // raw data
  const candle2 = new Candle(ts, o, h, l, c, v) // params
  const candle3 = new Candle({ ts, o, h, l, c, v }) // object params

  expect(candle1.getRaw()).toEqual(raw)
  expect(candle2.getRaw()).toEqual(raw)
  expect(candle3.getRaw()).toEqual(raw)
})

test('constructor without volume', () => {
  const expecedRaw = [ts ,o ,h ,l ,c]
  const candle =  new Candle(expecedRaw) // raw data
  expect(candle.getRaw()).toEqual([...expecedRaw, undefined])
})

test('mongo constructor', () => {
  const doc = {
    _id: ts,
    data: raw
  }

  const candle =  new Candle(doc) // raw data
  expect(candle.getRaw()).toEqual(raw)
})

