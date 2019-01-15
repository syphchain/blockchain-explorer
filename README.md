# blockchain-explorer

基于 Fabric 区块链网络的区块浏览器

Note: 本项目为业余维护和开发的项目，不做强制要求必须参与，参与肯定会有很大的好处。我们一起做些事情，并一步步将它推动下去，完成，这就是我们想要的。

### 项目目标

1. 了解和使用 Fabric 的区块链网络
2. 理解区块链技术
3. 了解区块浏览器的原理和用处
4. 将 Node.js 和 React（or Vue）学以致用
5. 尝试主动推动一个事情，并将它完成

### 迭代

咱们尝试使用 issue 来管理计划和任务。

### 项目运行基本(需要全局安装)

- node LTS
- mocha

### 测试

- mocha
- ava

***由于初次实践nodejs测试框架的原因选择了使用更为广泛的mocha,而ava则是下一代的测试框架,在熟识后再采取ava使用***

#### 测试所需依赖

- mocha
- chai
- supertest

#### 测试代码在root/test目录下,以*.test.js形式命名,启动: npm test

### 关于日志

- 引入log4js
- 日志文件存放在root/logs下面
- 现在分三种类型 app, access, errors
- 使用`let log = require('path/common/log4js').getLogger("errors"); log.debug('some log text')`

### 关于swagger接口文档自动生成

- 使用 koa2-swagger-ui 和 swagger-jsdoc
- 通过对接口处添加yaml格式的注释来让swagger-jsdoc自动获取到接口信息
- 准备了两个接口,一个是swagger-ui的访问地址ip:port/docs,另一个是swagger-jsdoc获取到的api以json格式返回的的接口'/swagger'两者结合启用
- 访问ip:port/docs查看文档
- 接口注释示例:
```
/**
 * @swagger
 *
 * /users:
 *   post:
 *     description: Creates a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in:  body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/NewUser'
 *     responses:
 *       200:
 *         description: users
 *         schema:
 *           $ref: '#/definitions/User'
 */
```

### 关于数据库

- 使用mogondb
- 使用mongoose提供的接口对数据库进行CURD
- 流程 mongoose connected -> schema -> model -> CURD接口
- [mongoose操作文档](https://mongoosejs.com/docs/api.html#Model)
- [mongoose典型使用](https://www.cnblogs.com/ostrich-sunshine/p/6755304.html)