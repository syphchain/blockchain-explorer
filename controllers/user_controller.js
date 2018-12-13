const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');

exports.getUser = async (ctx, next) => {
  if (ctx.query.id != 1) {
    throw new ApiError(ApiErrorNames.USER_NOT_EXIST);
  }
  ctx.body = {
    username: 'koa2',
    age: 3
  }
}

exports.registerUser = async (ctx, next) => {
  console.log('registerUser', ctx.request.body)
}