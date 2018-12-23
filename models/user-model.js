const mongoose = require('../dbs/dbconnect.js');
let userSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: Number, default: 123456 },
  time: { type: Date }
});

let user = mongoose.model('userModel', userSchema);
module.exports = user;