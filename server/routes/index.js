const Router = require('koa-router')
require('../models')
const { checkToken } = require('../middlewares/check-token')
const { stick, draft, index, byTag } = require('../middlewares/flag')
const router = new Router()
const user = require('../controllers/user')
const tag = require('../controllers/tag')
const article = require('../controllers/article')
const comment = require('../controllers/comment')
const tool = require('../controllers/tool')

router
  .get('/rss.xml', tool.rss)
  .get('/sitemap.xml', tool.sitemap)
  .get('/robots.txt', tool.robots)
  .post('/api/send-email', tool.sendEmail)

router
  .get(/\/api\/oauth\/github\/callback/, user.githubCallback)
  .get('/api/oauth/github/:state?', user.githubLogin)

router
  .get('/api/user/:username?', user.getUserInfo)
  .patch('/api/user', checkToken, user.patchUserInfo)
  .patch('/api/password', checkToken, user.patchUserPassword)
  .post('/api/login', user.login)
  .post('/api/logout', checkToken, user.logout)
  // .post('/api/register', user.register)

router
  .get('/api/tags', tag.getTags)
  .post('/api/tag', checkToken, tag.postTag)
  .patch('/api/tag', checkToken, tag.patchTag)
  .del('/api/tag/:id?', checkToken, tag.deleteTag)

router
  .get('/api/article/:id?', article.getArticle)
  .get('/api/search/:keyword/:page?/:limit?', article.getArticles)
  .get('/api/articles/:page?/:limit?', index, article.getArticles)
  .get('/api/stick/:page?/:limit?', stick, article.getArticles)
  .get('/api/tag/:id/:page?/:limit?', byTag, article.getArticles)
  .get('/api/drafts/:page?/:limit?', checkToken, draft, article.getArticles)
  .post('/api/article', checkToken, article.postArticle)
  .post('/api/upload', checkToken, article.upload)
  .patch('/api/article', checkToken, article.patchArticle)
  .del('/api/article/:id?', checkToken, article.deleteArticle)

router
  .post('/api/comment', comment.postComment)
  .get('/api/comments', comment.getComments)
  .del('/api/comment/:id?', checkToken, comment.deleteComment) // 管理员可以删除评论

module.exports = router
