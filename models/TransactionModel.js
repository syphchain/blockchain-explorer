const mongoose = require('../dbs/dbconnect.js');
let transaction = new mongoose.Schema({
  blockid: { type: Number },
  txhash: { type: String },
  createdt: { type: String },
  chaincodename: { type: String },
  chaincode_id: { type: String },
  status: { type: String },
  creator_msp_id: { type: String },
  endorser_msp_id: { type: String },
  type: { type: String },
  read_set: { type: Object },
  write_set: { type: Object },
  validation_code: { type: String },
  envelope_signature: { type: String },
  payload_extension: { type: String },
  creator_nonce: { type: String },
  chaincode_proposal_input: { type: String },
  endorser_signature: { type: String },
  creator_id_bytes: { type: String },
  payload_proposal_hash: { type: String },
  endorser_id_bytes: { type: String }
});

let TransactionModel = mongoose.model('transaction', transaction);
module.exports = TransactionModel;
