const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // ❗ ensures email is unique
  },
  password: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('User', UserSchema);
