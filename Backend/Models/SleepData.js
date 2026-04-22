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
    type: String, 
    required: true
  }
}, { timestamps: true });

sleepDataSchema.index({ user: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('SleepData', sleepDataSchema);
