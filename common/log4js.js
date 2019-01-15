// log4js配置
const log4js = require('log4js');
const config = require('../config/log4js.json');
let getLogger = function (moduleName) {
  var logger = log4js.getLogger(moduleName);
  log4js.configure(config);
  return logger;
};

exports.getLogger = getLogger;
