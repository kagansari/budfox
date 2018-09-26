const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const router = require('./router')

let app

exports.start = async () => {
  app = express()

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))
  // parse application/json
  app.use(bodyParser.json())

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    next()
  })

  app.use('/api', router)
  // bundled site files
  app.use(express.static(path.join(__dirname, '../../dist')))
  // app.use((req, res) => res.sendFile(path.join(__dirname, '../../dist/index.html'))) // @todo what?

  const port = process.env.PORT || 8000
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`) // eslint-disable-line no-console
  })
}
