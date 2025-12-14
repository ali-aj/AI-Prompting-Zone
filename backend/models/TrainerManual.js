const mongoose = require('mongoose');

const trainerManualSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  s3Key: {
    type: String,
    required: true
  },
  s3Bucket: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('TrainerManual', trainerManualSchema); 