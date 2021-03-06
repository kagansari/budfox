const { MongoClient, Server } = require('mongodb')
const moment = require('moment')
const debug = require('debug')('bs:db')
const Candle = require('./Candle')
const Dataset = require('./Dataset')

let db // mongodb instance
let client // MongoClient instance

const parseCollectionName = (collectionName) => {
  const [type, exchange, base, quote] = collectionName.split('_')
  if (type !== 'candles') {
    return false
  }

  const symbol = `${base}/${quote}`
  return { exchange, symbol }
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

// remove all collections
exports.reset = async () => {
  await db.dropDatabase()
}

/**
 * @param {Dataset} dataset
 */
exports.saveDataset = async (dataset) => {
  const documents = dataset.candles.map(candle => candle.getDocument())

  await db.collection(dataset.collectionName).insertMany(documents, {
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
 * @return {[Dataset]}
 */
exports.exploreDatasets = async () => {
  const collections = await db.collections()
  const datasets = []
  for (const collection of collections) {
    const { exchange, symbol } = parseCollectionName(collection.collectionName)
    if (exchange && symbol) {
      const ranges = await findRanges(collection.collectionName)
      for (const range of ranges) {
        datasets.push(new Dataset({ exchange, symbol, ...range }))
      }
    }
  }
  return datasets
}

/**
 * @param {Dataset} dataset
 * @return {Dataset} loaded dataset
 */
exports.fillDataset = async (dataset) => {
  const coll = db.collection(dataset.collectionName)

  const query = { _id: { $gte: dataset.from, $lte: dataset.to } }
  const candleDocs = await coll.find(query).sort('_id', 1).toArray()
  const candles = candleDocs.map(c => new Candle(c))

  return dataset.setCandles(candles)
}

/**
 * @param {Dataset} dataset
 * @return {Object} { next: Promise }
 */
exports.getItarator = (dataset) => {
  const coll = db.collection(dataset.collectionName)
  if (!coll) {
    throw new Error(`Collection ${dataset.collectionName} not found`)
  }

  const cursor = coll
    .find({ _id: { $gte: dataset.from, $lte: dataset.to }})
    .sort('_id', 1)

  return {
    next: async () => {
      if (await cursor.hasNext()) {
        const raw = await cursor.next()
        return new Candle(raw)
      }
      throw 'Data over'
    }
  }
}
