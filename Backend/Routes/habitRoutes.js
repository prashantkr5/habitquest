const express = require('express');
const router = express.Router();
const { getHabits, createHabit, updateHabitStatus, deleteHabit } = require('../Controllers/habitController');
const { protect } = require('../Middleware/auth');

router.route('/').get(protect, getHabits).post(protect, createHabit);
router.route('/:id').delete(protect, deleteHabit);
router.route('/:id/status').put(protect, updateHabitStatus);

module.exports = router;
