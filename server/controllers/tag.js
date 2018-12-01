const mongoose = require('mongoose')
const Tag = mongoose.model('Tag')

exports.getTags = async (ctx, next) => {
  try {
    let data = await Tag.find({}).sort({
      'updatedAt': -1
    }).exec()
    ctx.body = {
      success: true,
      data: data
    }
  } catch (e) {
    ctx.body = {
      success: false,
      err: e
    }
  }
}

exports.postTag = async (ctx, next) => {
  let body = ctx.request.body
  let {
    name
  } = body

  if (!name) {
    return (ctx.body = {
      success: false,
      err: 'Tag name is required'
    })
  }

  try {
    body = new Tag(body)
    await body.save()
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

exports.patchTag = async (ctx, next) => {
  let body = ctx.request.body
  body.updatedAt = Date.now()
  const {
    id
  } = body
  if (!id) {
    return (ctx.body = {
      success: false,
      err: 'id is required'
    })
  }

  try {
    body = await Tag.findByIdAndUpdate(id, body).exec()
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

exports.deleteTag = async (ctx, next) => {
  let {
    id
  } = ctx.params

  if (!id) {
    return (ctx.body = {
      success: false,
      err: 'id is required'
    })
  }

  try {
    let body = await Tag.findByIdAndRemove(id).exec()
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
