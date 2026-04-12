const express = require('express');
const router = express.Router();
const { getEntries, createEntry, updateEntry, deleteEntry } = require('../Controllers/journalController');
const { protect } = require('../Middleware/auth');

router.route('/').get(protect, getEntries).post(protect, createEntry);
router.route('/:id').put(protect, updateEntry).delete(protect, deleteEntry);

module.exports = router;
