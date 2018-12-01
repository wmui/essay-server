const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
const axios = require('axios')
const url = require('url')
const config = require('../config')
const User = mongoose.model('User')

exports.login = async (ctx, next) => {
  let {
    username,
    password
  } = ctx.request.body
  password = md5(password)
  try {
    let user = await User.findOne({
      username: username,
      password: password
    }).exec()
    let secret = config.jwt.secret
    let expiresIn = config.jwt.expiresIn
    let token = jwt.sign({
      username: user.username,
      userID: user._id
    }, secret, {
      expiresIn: expiresIn
    })
    ctx.cookies.set('token', token)
    ctx.body = {
      success: true,
      data: {
        token: token
      }
    }
  } catch (e) {
    ctx.body = {
      success: false,
      err: e
    }
  }
}

exports.logout = (ctx, next) => {
  ctx.cookies.set('token', null)
  ctx.body = {
    success: true,
    data: {}
  }
}

exports.getUserInfo = async (ctx, next) => {
  // 用户名必须是唯一的
  let username = ctx.params.username || config.user.username
  try {
    let user = await User.findOne({
      username
    }).exec()
    if (user.avatar === 'avatar.png') {
      // 默认头像
      user.avatar = config.domain + '/public/avatar.png'
    }
    ctx.body = {
      success: true,
      data: user
    }
  } catch (e) {
    ctx.body = {
      success: false,
      err: e
    }
  }
}

exports.patchUserInfo = async (ctx, next) => {
  let body = ctx.request.body
  let username = ctx.state.username
  try {
    body.updatedAt = Date.now()
    body = await User.findOneAndUpdate({
      username
    }, body).exec()
    ctx.body = {
      success: true,
      data: body
    }
  } catch (e) {
    ctx.body = {
      success: false,
      err: e
    }
  }
}

exports.patchUserPassword = async (ctx, next) => {
  let body = ctx.request.body
  let username = ctx.state.username
  if (body.oldPassword && body.newPassword) {
    let oldPassword = md5(body.oldPassword)
    let newPassword = md5(body.newPassword)
    try {
      let user = await User.findOne({
        username
      }).exec()
      if (user.password !== oldPassword) {
        return (ctx.body = {
          success: false,
          err: 'Wrong password'
        })
      }
      body = await User.findOneAndUpdate({
        username
      }, {
        password: newPassword,
        updatedAt: Date.now()
      }).exec()
      ctx.body = {
        success: true,
        data: ''
      }
    } catch (e) {
      ctx.body = {
        success: false,
        err: e
      }
    }
  } else {
    ctx.body = {
      success: false,
      err: 'Field incomplete'
    }
  }
}

exports.register = async (ctx, next) => {
  let {
    username,
    password
  } = ctx.request.body
  if (username && password) {
    try {
      let user = await User.findOne({
        username: username
      }).exec()
      if (user) {
        ctx.body = {
          success: false,
          err: 'The username is taken'
        }
      } else {
        user = new User({
          username: username,
          password: md5(password)
        })
        await user.save() // 注册用户
        user = await User.findOne({
          username: username
        }).exec()
        let secret = config.jwt.secret
        let expiresIn = config.jwt.expiresIn
        let token = jwt.sign({
          username: user.username,
          userID: user._id
        }, secret, {
          expiresIn: expiresIn
        })
        ctx.cookies.set('token', token)
        ctx.body = {
          success: true,
          data: {
            token: token
          }
        }
      }
    } catch (e) {
      ctx.body = {
        success: false,
        err: e
      }
    }
  } else {
    ctx.body = {
      success: false,
      err: 'Field incomplete'
    }
  }
}

// state表示github授权后的回调信息
let state = ''
exports.githubLogin = (ctx, next) => {
  state = ctx.params.state || ''
  let u = `https://github.com/login/oauth/authorize?client_id=${config.githubConfig.githubClient}&scope=${config.githubConfig.scope}&redirect_uri=${config.domain}/api/oauth/github/callback&state=${state}`
  ctx.res.statusCode = 302
  ctx.res.setHeader('location', u)
  ctx.res.end()
}

// 授权成功后的回调函数
exports.githubCallback = async (ctx, next) => {
  let query = url.parse(ctx.req.url, true).query
  let code = query.code
  let u = `https://github.com/login/oauth/access_token?client_id=${config.githubConfig.githubClient}&client_secret=${config.githubConfig.githubSecret}&code=${code}&state=${state}`
  let githubToken = ''

  // 把获取到的token设置到cookie里
  await axios.get(u).then((ret) => {
    const {
      data
    } = ret
    let arr = data.split('&'),
      obj = {}
    arr.forEach(function (item) {
      let key = item.split('=')[0]
      let value = item.split('=')[1]
      obj[key] = value
    })
    if (obj.access_token) {
      githubToken = obj.access_token
      ctx.cookies.set('githubToken', obj.access_token)
    } else {
      ctx.cookies.set('githubToken', '')
    }
  })
  if (githubToken) {
    let userInfo = {}
    // 把用户信息保存到数据库
    await axios.get(`https://api.github.com/user?access_token=${githubToken}`).then(ret => {
      const {
        data
      } = ret
      userInfo.username = data.login
      userInfo.email = data.email
      userInfo.nickname = data.name
      userInfo.motto = data.bio
      userInfo.avatar = data.avatar_url
    })

    // 信息初次保存
    var user = await User.findOne({
      username: userInfo.username
    }).exec()
    if (!user) {
      user = new User(userInfo)
      await user.save()
    }
  }
  // 完成授权后页面重定向
  return ctx.response.redirect(`${config.domain}/detail/${state}`)
}