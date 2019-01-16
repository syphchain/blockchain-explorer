const mongoose = require('../dbs/dbconnect.js');
let peer = new mongoose.Schema({
  ledger_height_high: { type: Number },
  ledger_height_low: { type: Number },
  ledger_height_unsigned: { type: Boolean },
  mspid: { type: String },
  peer_type: { type: String },
  requests: { type: String },
  server_hostname: { type: String },
  status: { type: String }
});

let PeerModel = mongoose.model('peer', peer);
module.exports = PeerModel;
