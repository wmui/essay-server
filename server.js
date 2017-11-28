const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const router = require('./server/router.js')
const resolve = file => path.resolve(__dirname, file)
const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache ? 1000 * 60 * 60 * 24 * 30 : 0 })
const hasToken = require('./server/has-token.js')
const app = express()
app.use(cors())
app.use('/public', serve('./public', false))
// 获取已发布文章列表
app.get('/v1/posts', router.posts)

// 获取管理员信息
app.get('/v1/administrator', router.admin)

// 获取文章详情 eg:http://localhost:8080/v1/article?id=1496841740682
app.get('/v1/article', router.getArticle)

// 获取标签列表
app.get('/v1/tags', router.tags)

// 获取某个标签下的文章列表  eg: http://localhost:8080/v1/tag?tag=javascript
app.get('/v1/tag', router.tag)

// 搜索(目前仅支持按标题搜索) eg:http://localhost:8080/v1/search?q=j
app.get('/v1/search', router.search)

// 获取归档列表
app.get('/v1/archives', router.archives)

// 获取某个归档下的文章列表 eg:http://localhost:8080/v1/archive?date=201706
app.get('/v1/archive', router.archive)

// 获取所有文章(包括草稿)
app.get('/v1/articles', hasToken, router.articles)

// 管理员登录
app.post('/v1/login', router.login)

// 发布文章，发布草稿，编辑文章
app.post('/v1/article', hasToken, router.article)

// 更新管理员信息
app.put('/v1/administrator', hasToken, router.updateInfo)

// 更新管理员头像
app.post('/v1/avatar', hasToken, router.avatar)

// 发布文章时，文章中的图片上传接口
app.post('/v1/upload', hasToken, router.upload)

// 修改密码
app.put('/v1/password', hasToken, router.updatePassword)

// 删除文章 eg: http://localhost:8080/v1/article?id=1496841740682
app.delete('/v1/article', hasToken, router.deleteArticle)

// api地址错误处理
app.get('*', router.noData)
app.post('*', router.noData)
app.put('*', router.noData)
app.delete('*', router.noData)
app.listen(8080, () => {
  console.log('server started at localhost:8080')
})