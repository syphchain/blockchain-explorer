/**
* 对数据库的增删改查
*/
const logger = require('../common/log4js').getLogger('CRUDService');
logger.debug('come in crudservice');
const BlockModel = require('../models/BlockModel');
const TransactionModel = require('../models/TransactionModel');
const PeerModel = require('../models/PeerModel');

class CURDServices {
  constructor () {}
  async saveBlockRow (blockRow) {
    new BlockModel(blockRow).save((err, res) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info('saveBlockRow succeed', res, '\n');
      }
    })
  }
  async saveTransactionRow (transactionRow) {
    new TransactionModel(transactionRow).save((err, res) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info('Save Transaction Row succeed', res, '\n');
      }
    })
  }
  async savePeerRow (peerRow) {
    new PeerModel(peerRow).save((err, res) => {
      if (err) {
        logger.error(err);
      } else {
        logger.info('Save Peer Row succeed', res, '\n');
      }
    })
  }
}

module.exports = CURDServices;
