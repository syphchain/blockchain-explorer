const router = require('koa-router')();
const user_router = require('./user_router');

router.use('/users', user_router.routes(), user_router.allowedMethods());

module.exports = router;