const Task = require('../Models/Task');
const User = require('../Models/User');
const { processGamification } = require('../Utils/gamificationEngine');

// @desc    Get user's tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, priority, xpReward } = req.body;

    const task = await Task.create({
      user: req.user.id,
      title,
      description: description || '',
      priority: priority || 'Medium',
      xpReward: xpReward || 10
    });

    await processGamification(req.user.id, 'create', 'task', title, 0);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task (title, priority)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, priority, description } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    if (title) task.title = title;
    if (priority) task.priority = priority;
    if (description !== undefined) task.description = description;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status & Trigger Gamification
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    let userStats = null;
    if (status === 'completed' && task.status !== 'completed') {
      userStats = await processGamification(req.user.id, 'complete', 'task', task.title, task.xpReward);
    } else if (status === 'pending' && task.status === 'completed') {
      userStats = await processGamification(req.user.id, 'undo', 'task', task.title, task.xpReward);
    }

    task.status = status;
    const updatedTask = await task.save();
    
    res.status(200).json({
      task: updatedTask,
      userStats: userStats || {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await task.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
