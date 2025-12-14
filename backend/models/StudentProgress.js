const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true // Each student should have only one progress record
  },
  prompts: {
    type: Number,
    default: 0
  },
  appsUnlocked: [
    {
      type: String // Store toolName or app name
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProgress', studentProgressSchema); 