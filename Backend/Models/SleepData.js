const mongoose = require('mongoose');

const sleepDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hours: {
    type: Number,
    required: true
  },
  dateString: {
    type: String, // e.g. "2023-10-15"
    required: true
  }
}, { timestamps: true });

// Prevent duplicate entries per user per day
sleepDataSchema.index({ user: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('SleepData', sleepDataSchema);
