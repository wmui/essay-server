require('./models')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const cors = require('cors')
const resolve = file => path.resolve(__dirname, file)
const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache ? 1000 * 60 * 60 * 24 : 0
})
app.enable('trust proxy')
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use('/public', serve('./public', true))
app.use('/v1', require('./routes/base'))
app.use('/v1', require('./routes/tag'))
app.use('/v1', require('./routes/user'))
app.use('/v1', require('./routes/article'))
app.use('/v1', require('./routes/oauth'))
app.use('/v1', require('./routes/comment'))
app.use(require('./routes/tool'))

app.all('/v1/*', (req, res) => {
  res.json({
    success: false,
    err: 'api is invalid'
  })
})

app.listen(3010, () => {
  console.log('server started at 127.0.0.1:3010')
})
