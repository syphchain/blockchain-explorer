const ApiError = require('../error/ApiError');

let response_formatter = async (ctx, next) => {
  if (ctx.body) {
    ctx.body = {
      code: 0,
      message: 'success',
      data: ctx.body
    }
  } else {
    ctx.body = {
      code: 0,
      message: 'success'
    }
  }
}

let url_filter = (pattern) => {
  return async (ctx, next) => {
    let reg = new RegExp(pattern);
    try {
      await next();
    } catch (error) {
      if (error instanceof ApiError && reg.test(ctx.originalUrl)) {
        ctx.status = 200;
        ctx.body = {
          code: error.code,
          message: error.message
        }
      }
      // 需要抛出错误后续处理
      // throw error;
    }
    if (reg.test(ctx.originalUrl)) {
      response_formatter(ctx);
    }
  }
}

module.exports = url_filter;