const MarkdownIt = require('markdown-it')
const mongoose = require('mongoose')
const config = require('../config')
const Article = mongoose.model('Article')

// sitemap
exports.sitemap = async (req, res, next) => {
  let sitemap = ''
  let head = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\r\n`
  let tail = '</urlset>'
  let articles = await Article.find({
    flag: { $ne: 3 }
  }).sort({
    'created_at': -1
  }).exec()
  let body = articles.reduce((prev, curr) => {
    prev += `
      <url>
        <loc>${config.domain}/detail/${curr.id}</loc>
        <lastmod>${curr.updated_at}</lastmod>
        <priority>0.6</priority>
      </url>`.trim()
    return prev
  }, '')
  sitemap = head + body + tail
  res.set('Content-Type', 'application/xml')
  res.end(sitemap)
}


// rss
exports.rss = async (req, res, next) => {
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
  let articles = await Article.find({
    flag: { $ne: 3 }
  }).limit(10).sort({
    'created_at': -1
  }).exec()
  let body = articles.reduce((prev, curr) => {
    let date = new Date(curr.updated_at).toUTCString()
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
  
  res.set('Content-Type', 'application/xml')
  rss = head + body + tail
  res.end(rss)
}



// robots
exports.robots = (req, res, next) => {
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
  res.end(robots)
}

