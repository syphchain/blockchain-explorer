const Koa = require('koa')
const fs = require('fs')
const app = new Koa()
const router = require('koa-router')()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
// 默认的koa-logger默认设置的拦截打印请求
const koalogger = require('koa-logger')
const logger = require('./common/log4js').getLogger('app');

// 路由处理相关
const url_filter = require('./middlewares/response_formatter')
const index = require('./routes/index')
const users = require('./routes/users')
const api = require('./routes/api')

// fabric-sync
const SyncPlatform = require('./platform/fabric/sync/SyncPlatform');
const Persistence = require('./dbs/Persistence');

/*sync_client.getRegisteredUser('admin', 'Org1', true).then(res => {
  logger.debug('register success %s', JSON.stringify(res));
}).catch(err => {
  logger.debug('register error %s', err);
})*/
async function sync () {
  let persistence = new Persistence();
  let platform = await SyncPlatform.build(persistence);
  platform.setPersistenceService();
  platform.initialize();
}
sync();
// swagger api文档相关
const port = process.env.port || 3000
// swagger-ui配置获取文档并部署到ip:prot/docs上
const koaSwagger = require('koa2-swagger-ui')
app.use(koaSwagger({
  routePrefix: '/docs',
  swaggerOptions: {
    url: `http://localhost:${port}/swagger`
  }
}))
// 执行了一次dbconnect
// require('./dbs/dbconnect.js')
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(koalogger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 添加格式化处理响应中间件,应在路由之前
app.use(url_filter('^/api'))

// routes
router.use('/api', api.routes(), api.allowedMethods())
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(api.routes(), api.allowedMethods())


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
