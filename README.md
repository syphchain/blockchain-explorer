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

### 项目运行基本(需要全局anzhuang)

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