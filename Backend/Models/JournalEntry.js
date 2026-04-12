const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    default: 'New Journal Entry'
  },
  content: {
    type: String,
    default: ''
  },
  dateString: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
