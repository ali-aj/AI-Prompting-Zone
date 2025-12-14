const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  subtitle: {
    type: String,
    required: true
  },
  icon: {
    data: Buffer,
    contentType: String
  },
  prompt: {
    type: String,
    required: true
  },
  toolName: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String
  },
  appLink: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

agentSchema.index({ order: 1, title: 1 });

module.exports = mongoose.model('Agent', agentSchema); 