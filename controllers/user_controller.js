const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
const userModel = require('../models/user-model.js');
const log = require('log4js').getLogger('user-controller');
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
  userModel.create([
    {
      username: 'jason1',
      password: 333334
    }
  ], (err, doc) => {
    if (err) {
      log.error(err);
    } else {
      log.info(doc);
    }
  }).then((doc) => {
    log.info(doc);
  });
}