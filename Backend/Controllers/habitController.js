const Habit = require('../Models/Habit');
const User = require('../Models/User');
const { processGamification } = require('../Utils/gamificationEngine');


const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createHabit = async (req, res) => {
  try {
    const { title, description, priority, xpReward, frequency, icon, color } = req.body;

    const habit = await Habit.create({
      user: req.user.id,
      title,
      description: description || '',
      priority: priority || 'Medium',
      xpReward: xpReward || 50,
      frequency: frequency || ['Daily'],
      icon: icon || 'Hexagon',
      color: color || '#4ae2ff'
    });

 
    await processGamification(req.user.id, 'create', 'habit', title, 0);

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateHabitStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    let newStreak = habit.streak;
    let userStats = null;

    if (status === 'completed' && habit.status !== 'completed') {
      newStreak += 1;
      habit.lastCompletedDate = Date.now();
      userStats = await processGamification(req.user.id, 'complete', 'habit', habit.title, habit.xpReward);
    } else if (status === 'missed' && habit.status !== 'missed') {
      newStreak = 0;
    } else if (status === 'pending' && habit.status === 'completed') {
   
      newStreak = Math.max(0, newStreak - 1);
      userStats = await processGamification(req.user.id, 'undo', 'habit', habit.title, habit.xpReward);
    }

    habit.status = status;
    habit.streak = newStreak;

    const updatedHabit = await habit.save();

    res.status(200).json({
      habit: updatedHabit,
      userStats: userStats || {} 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await habit.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHabits,
  createHabit,
  updateHabitStatus,
  deleteHabit
};
