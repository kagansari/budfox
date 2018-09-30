const express = require('express')
const router = express.Router()
const { db, Dataset } = require('../util')

router.get('/datasets', async (req, res) => {
  const datasets = await db.exploreDatasets()
  res.send(datasets.map(d => d.toJSON()))
})

router.get('/datasets/:exchange/:base/:quote/:from/:to', async (req, res) => {
  const { exchange, base, quote } = req.params
  const from = Number(req.params.from)
  const to = Number(req.params.to)

  const symbol = `${base}/${quote}`

  const dataset = new Dataset({ exchange, symbol, from, to })
  await db.fillDataset(dataset)
  res.send(dataset.candles.map(c => c.getRaw()))
})

module.exports = router
