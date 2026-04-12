const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: {
    type: String,
    default: ''
  },
  frequency: {
    type: [String],
    default: ['Daily']
  },
  icon: {
    type: String,
    default: 'Hexagon'
  },
  color: {
    type: String,
    default: '#4ae2ff'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  streak: {
    type: Number,
    default: 0
  },
  xpReward: {
    type: Number,
    default: 50
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed'],
    default: 'pending'
  },
  lastCompletedDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
