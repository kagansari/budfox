const express = require('express')
const router = express.Router()
const util = require('../util')

router.get('/datasets', async (req, res) => {
  const datasets = await util.db.exploreDatasets()
  res.send(datasets)
})

router.get('/datasets/:exchange/:base/:quote', async (req, res) => {
  const { exchange, base, quote } = req.params
  const from = Number(req.params.from)
  const to = Number(req.params.to)

  const symbol = `${base}/${quote}`

  const dataset = await util.db.getDataset(exchange, symbol, from, to)
  res.send(dataset)
})

module.exports = router
