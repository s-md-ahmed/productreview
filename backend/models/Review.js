const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  username: String,
  rating: Number,
  comment: String
});

module.exports = mongoose.model('Review', ReviewSchema);
