const mongoose = require('mongoose');

const customAgentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true
  },
  description: {
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
    type: String
  },
  videoUrl: {
    type: String,
    default: "" 
  },
  appLink: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

customAgentSchema.index({ createdBy: 1, title: 1 });
customAgentSchema.index({ isPublic: 1 });

module.exports = mongoose.model('CustomAgent', customAgentSchema);