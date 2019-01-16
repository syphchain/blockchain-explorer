const mongoose = require('../dbs/dbconnect.js');
let blockSchema = new mongoose.Schema({
  blocknum: { type: Number },
  prehash: { type: String },
  time: { type: Date },
  txcount: { type: Number },
  createdt: { type: Date },
  blockhash: { type: String }
});

let BlockModel = mongoose.model('block', blockSchema);
module.exports = BlockModel;