/*const { JSDOM } = require('jsdom')
const dom = new JSDOM('<!DOCTYPE html></html>', { url: 'http://localhost:8080' })
global.window = dom.window
global.document = window.document
global.navigator = window.navigator*/

const cookieParser = require('cookie-parser')
const router = require('./server/router.js')
const cors = require('cors')
const hasToken = require('./server/has-token.js')

const fs = require('fs')
const path = require('path')
const resolve = file => path.resolve(__dirname, file)
const express = require('express')

const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache ? 1000 * 60 * 60 * 24 * 30 : 0
})

const app = express()
app.use(cookieParser())
app.use(cors())
app.use('/public', serve('./public', false))
// client http intercept
app.get('/login', function(req, res, next) {
  if (req.cookies.token) {
    res.redirect('/')
  } else {
    next()
  }
})

// server http intercept
app.get(['/admin', '/admin/*', '/publish', '/publish/*', '/updateAdminPassword', '/updateAdminInfo'], function(req, res, next) {
  if (req.cookies.token) {
    next()
  } else {
    res.redirect('/login')
  }
})

// published articles
app.get('/api/posts', router.posts)

// administrator infomation
app.get('/api/administrator', router.admin)

// article detail content http://localhost:8080/api/article?id=1496841740682
app.get('/api/article', router.getArticle)

// tags infomation
app.get('/api/tags', router.tags)

// get articles by tag http://localhost:8080/api/tag?tag=javascript
app.get('/api/tag', router.tag)

// search articles http://localhost:8080/api/search?q=js
app.get('/api/search', router.search)

// archives infomation
app.get('/api/archives', router.archives)

// get articles by archive http://localhost:8080/api/archive?date=201706
app.get('/api/archive', router.archive)

// all articles
app.get('/api/articles', router.articles)

// publish or edit article
app.post('/api/article', hasToken, router.article)

// administrator login
app.post('/api/login',router.login)

// administrator logout
app.post('/api/logout', router.logout)

// update administrator infomation
app.put('/api/administrator', hasToken, router.updateAdminInfo)

// update administrator avatar
app.post('/api/avatar', hasToken, router.avatar)

app.post('/api/upload', hasToken, router.upload)

// update administrator password
app.put('/api/password', hasToken, router.updateAdminPassword)

// delete article  http://localhost:8080/api/article?id=1496841740682
app.delete('/api/article', hasToken, router.deleteArticle)

app.listen(8080, () => {
  console.log('server started at localhost:8080')
})