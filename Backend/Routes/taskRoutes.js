const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, updateTaskStatus, deleteTask } = require('../Controllers/taskController');
const { protect } = require('../Middleware/auth');

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);
router.route('/:id/status').put(protect, updateTaskStatus);

module.exports = router;
