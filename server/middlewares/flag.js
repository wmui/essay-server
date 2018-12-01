exports.stick = async (ctx, next) => {
   ctx.params.flag = 0
   await next()
}

exports.index = async (ctx, next) => {
  ctx.params.flag = 1
  await next()
}

exports.byTag = async (ctx, next) => {
  ctx.params.flag = 2
  await next()
}

exports.draft = async (ctx, next) => {
  ctx.params.flag = 3
  await next()
}