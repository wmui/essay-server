const MarkdownIt = require('markdown-it')
const mongoose = require('mongoose')
const config = require('../config')
const nodemailer = require('nodemailer')
const Article = mongoose.model('Article')

// sitemap
exports.sitemap = async(ctx, next) => {
  let sitemap = ''
  let head = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\r\n`
  let tail = '</urlset>'
  let res = await Article.find({ publish: true }).sort({ 'createdAt': -1 }).exec()
  let body = res.reduce((prev, curr) => {
    prev += `
      <url>
        <loc>${config.domain}/detail/${curr.id}</loc>
        <lastmod>${curr.updatedAt}</lastmod>
        <priority>0.6</priority>
      </url>`.trim()
    return prev
  }, '')
  sitemap = head + body + tail
  ctx.type = 'application/xml'
  ctx.res.end(sitemap)
}


// rss
exports.rss = async(ctx, next) => {
  let rss = ''
  let head = `<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
    <channel>
      <title>${config.user.nickname}</title>
      <link>${config.domain}</link>
      <description>${config.user.motto}</description>
      <atom:link href="${config.domain}/rss.xml" rel="self"/>
      <language>zh-CN</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\r\n`
  let tail = `</channel>\r\n</rss>`
  let res = await Article.find({ publish: true }).limit(10).sort({ 'createdAt': -1 }).exec()
  let body = res.reduce((prev, curr) => {
    let date = new Date(curr.updatedAt).toUTCString()
    let md = new MarkdownIt()
    let content = md.render(curr.content)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
    prev += `
      <item>
        <title>${curr.title}</title>
        <link>${config.domain}/detail/${curr.id}</link>
        <description>${content}</description>
        <pubDate>${date}</pubDate>
        <guid>${config.domain}/detail/${curr.id}</guid>
      </item>`.trim()
    return prev
  }, '')
  ctx.type = 'application/xml'
  rss = head + body + tail
  ctx.res.end(rss)
}



// robots
exports.robots = (ctx, next) => {
  let robots = `
    User-agent: *
    Allow: /
    Sitemap: ${config.domain}/sitemap.xml
    User-agent: YisouSpider
    Disallow: /
    User-agent: EasouSpider
    Disallow: /
    User-agent: EtaoSpider
    Disallow: /
    User-agent:`.trim()
  ctx.res.end(robots)
}

exports.sendEmail = async (ctx, next) => {
  let body = ctx.request.body
  let {
    fromUserNickname,
    fromUserContent,
    fromUserEmail,
    toUserNickname,
    toUserContent,
    toUserEmail,
    articleId
  } = body
  if (!fromUserNickname || !fromUserContent || !fromUserEmail || !toUserNickname || !toUserContent || !toUserEmail || !articleId) {
    return (ctx.body = {
      success: false,
      err: 'Field incomplete'
    })
  }
  let transporter = nodemailer.createTransport({
    service: 'qq',
    port: 465,
    secure: true,
    auth: {
      user: config.emailConfig.user,
      pass: config.emailConfig.pass
    }
  })
  let mailOptions = {
    from: config.emailConfig.user,
    to: toUserEmail,
    subject: '博客评论通知',
    html: `<p>${fromUserNickname}回复了你的评论：<p>
    <p>原内容：${toUserContent}<p>
    <p>回复内容：${fromUserContent}<p>
    <p><a href="${config.domain}/detail/${articleId}">查看原文</a></p>`.trim()
  }
  await transporter.sendMail(mailOptions).then(function(info){
    ctx.body = {
      success: true,
      data: info
    }
  }).catch(function(err){
     ctx.body = {
      success: false,
      err: err
    }
  })
}
