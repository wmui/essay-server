const path = require('path')
const Koa = require('koa')
const KoaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const KoaLogger = require('koa-logger')
const Router = require('koa-router')
const cors = require('@koa/cors')
const route = require('./routes')

const app = new Koa()
const router = new Router()

app.use(cors())
app.use(bodyParser())
app.use(KoaStatic(path.join(__dirname, './../public')))
app.use(KoaLogger())
router.use('', route.routes())
app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3001)

console.log('Server listening on 127.0.0.1:3001')
