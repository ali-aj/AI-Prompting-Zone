const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
    trim: true
  },
  reuqesterName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Club = mongoose.model('Club', clubSchema);

module.exports = Club; 