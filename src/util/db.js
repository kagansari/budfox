const { MongoClient, Server } = require('mongodb')
const moment = require('moment')
const debug = require('debug')('bs:db')
const util = require('./index')

let db // mongodb instance
let client // MongoClient instance

const getCollectionName = (exchange, symbol) => {
  const [base, quote] = symbol.split('/')
  return `${exchange}_${base}_${quote}`
}

const parseCollectionName = (collectionName) => {
  const [exchangeName, base, quote] = collectionName.split('_')
  if (!util.broker.exchanges[exchangeName]) {
    return false
  }
  const symbol = `${base}/${quote}`
  if (!symbol) {
    return false
  }
  return { exchange: exchangeName, symbol }
}

// try to connect to the db once in a sec
exports.init = async () => {
  const { MONGO_URL, MONGO_PORT, MONGO_DB } = process.env
  do {
    try {
      client = await MongoClient.connect(new Server(MONGO_URL, MONGO_PORT))
      db = client.db(MONGO_DB)
    } catch (err) {
      debug(err.message, ' Retrying again in 1 sec')
      await new Promise(res => setTimeout(res, 1000))
    }
  } while (!db)
  console.log(`Connected to database ${MONGO_URL}:${MONGO_PORT}/${MONGO_DB}`) // eslint-disable-line no-console
}

exports.close = async () => {
  await client.close()
}

/**
 * @param {String} exchange
 * @param {String} symbol
 * @param {[[TS,O,H,L,C,V]]} candles
 */
exports.saveCandles = async (exchange, symbol, candles) => {
  const collectionName = getCollectionName(exchange, symbol)
  const documents = candles.map(candle => ({
    _id: candle[0],
    data: candle
  }))

  await db.collection(collectionName).insertMany(documents, {
    ordered: false
  }).catch(err => {
    debug(`${err.writeErrors.length} duplicate items found, ignoring`)
  })
}

/**
 * find intervals in a candle collection
 * @param {String} collectionName binance_BTC_USDT
 * @return {[Object]} [{ from: timestamp, to: timestamp }]
 */
const findRanges = async (collectionName) => {
  const coll = db.collection(collectionName)
  const cursor = await coll.find().sort('_id', 1)
  // collection is consecutive if document number and time intervals match
  const count = await cursor.count()
  const firstDoc = await cursor.next()
  const lastDoc = await coll.find().sort('_id', -1).next()
  const expectedCount = ((lastDoc._id - firstDoc._id) / 60000) + 1

  if (count === expectedCount) {
    debug(`Collection ${collectionName} new range From: ${moment(firstDoc._id).toISOString()} To: ${moment(lastDoc._id).toISOString()}`)
    return [{
      from: firstDoc._id,
      to: lastDoc._id
    }]
  }

  // find ranges scanning whole collection
  const ranges = []
  let rangeStartDoc = firstDoc
  let nextDoc

  // check consecutive candles
  while (await cursor.hasNext()) {
    let previousDoc = nextDoc || firstDoc
    nextDoc = await cursor.next()
    // if interval is longer than 1 min, save it as a range and start over the next candle
    if (nextDoc._id - previousDoc._id > 60000) {
      ranges.push({
        from: rangeStartDoc._id,
        to: previousDoc._id
      })
      debug(`Collection ${collectionName} new range From: ${moment(rangeStartDoc._id).toISOString()} To: ${moment(previousDoc._id).toISOString()}`)
      rangeStartDoc = nextDoc
    }
  }
  // there is always one range ending with the last element of collection
  ranges.push({
    from: rangeStartDoc._id,
    to: nextDoc._id
  })
  debug(`Collection ${collectionName} new range From: ${moment(rangeStartDoc._id).toISOString()} To: ${moment(nextDoc._id).toISOString()}`)
  return ranges
}

/**
 * scan all database and find candle collections, return ranges
 * @return {[Object]} [{ exchange: 'binance', symbol: 'BTC/USDT', ranges: [{from, to}] }]
 */
exports.exploreDatasets = async () => {
  const collections = await db.collections()
  const datasets = []
  for (const collection of collections) {
    const { exchange, symbol } = parseCollectionName(collection.collectionName)
    if (exchange && symbol) {
      const ranges = await findRanges(collection.collectionName)
      for (const range of ranges) {
        datasets.push({ ...range, exchange, symbol })
      }
    }
  }
  return datasets
}

/**
 * @param {String} exchange
 * @param {String} symbol
 * @param {Number} from
 * @param {Number} to
 * @return {[TS,O,H,L,C,V]]} candles
 */
exports.getDataset = async (exchange, symbol, from, to) => {
  const coll = db.collection(getCollectionName(exchange, symbol))
  if (!coll) {
    throw new Error(`No data available for exchange:${exchange}, symbol: ${symbol}`)
  }

  if (!from) from = (await coll.find({}).sort('_id', 1).next())._id // earliest candle timestamp
  if (!to) to = (await coll.find({}).sort('_id', -1).next())._id // latest candle timestamp

  const query = { _id: { $gte: from, $lte: to } }
  const candles = await coll.find(query).sort('_id', 1).toArray()

  const count = candles.length
  const expectedCount = ((to - from) / 60000) + 1
  if (count != expectedCount) {
    throw new Error(`Expected ${expectedCount} candles but only ${count} found`)
  }

  return candles.map(c => c.data)
}

exports.getCandleCursor = async (exchange, symbol, from, to) => {
  const collName = getCollectionName(exchange, symbol)
  const coll = db.collection(collName)
  if (!coll) {
    throw new Error(`Collection ${collName} not found`)
  }

  const cursor = coll
  .find({ _id: { $gte: from, $lte: to }})
  .sort('_id', 1)

  const count = await cursor.count()
  const expectedCount = ((to - from) / 60000) + 1
  if (count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} candles but only ${count} found`)
  }

  return cursor
}
