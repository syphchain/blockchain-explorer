const mongoose = require('../dbs/dbconnect.js');
let schema = new mongoose.Schema({
  username: { type: String },
  password: { type: Number, default: 123456 },
  time: { type: Date }
});

let user = mongoose.model('user', schema);
module.exports = user;