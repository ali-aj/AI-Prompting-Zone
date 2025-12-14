const mongoose = require('mongoose');

const customAgentChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  customAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomAgent',
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    type: String,
    default: '{}'
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
customAgentChatSchema.index({ userId: 1, customAgentId: 1 });

module.exports = mongoose.model('CustomAgentChat', customAgentChatSchema);