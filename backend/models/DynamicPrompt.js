const mongoose = require('mongoose');

const dynamicPromptSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  systemPrompt: {
    type: String,
    required: true
  },
  userPrompt: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DynamicPrompt', dynamicPromptSchema); 