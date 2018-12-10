/*
* entry point in koa
*/
// 文件操作模块
const fs = require('fs');
// koa核心
const Koa = require('koa');
// 静态服务
const serve = require('koa-static');
// post请求体处理
const boyParser = require('koa-bodyparser');
// 路由处理
const router = require('koa-router')();
// server实例化
const app = new Koa();
// 加载对应中间件
app.use(serve(__dirname + '/app/public', { extensions: ['html'] }));
app.use(boyParser());
app.use(router.routes());

// get '/hello'
router.get('/hello', async (ctx, next) => {
  ctx.response.body = fs.readFileSync('./app/mock.json', { encoding: 'UTF-8' });
  await next();
});

app.listen(3000, () => {
  console.log('server is running in port 3000');
});
