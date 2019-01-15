const mongoose = require('mongoose');
const config = require('../config/mongo.json');
const log = require('../common/log4js').getLogger('dbconnect');
mongoose.connect(`mongodb://${config.host}:${config.port}/${config.collection}`, { useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', (error) => {
  log.error(error);
});

db.on('open', () => {
  log.info('mongo connected');
})

db.on('disconnected', () => {
  log.info('mongo disconnected');
});

module.exports = mongoose;
