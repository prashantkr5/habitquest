const User = require('../Models/User');
const Task = require('../Models/Task');
const JournalEntry = require('../Models/JournalEntry');
const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // 'none' required for cross-origin (Vercel frontend → Render backend)
    // 'lax' is fine for same-origin local dev
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const friendCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = await User.create({
      name,
      email,
      password,
      friendCode,
    });

    if (user) {
      // 🚀 Initialize Fresh Workspace for New Tenant
      await Task.create({
        user: user._id,
        title: 'Learn the Basics of HabitQuest',
        priority: 'High',
        xpReward: 100
      });

      const todayIso = new Date().toISOString().split('T')[0];
      await JournalEntry.create({
        user: user._id,
        title: '🎮 Welcome to HabitQuest — Your Adventure Begins!',
        content: `Hey ${name}! Welcome to HabitQuest. 🚀

This is your personal command center — a private space where your journey from Novice to Eternal begins.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗺️ YOUR QUEST MAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Daily Quests — Complete tasks every day to earn XP (Low: 5 XP, Medium: 8 XP, High: 10 XP)

🔥 Habit Quests — Build powerful routines. Every day you complete a habit extends your streak.

⚡ XP & Levels — Level up through 11 ranks: Novice → Apprentice → Scout → Hunter → Elite Hunter → Shadow Knight → Dark Paladin → Monarch → Grandmaster → Legend → Eternal

🏆 Guild Hall — Share your Friend Code with others and compete on the 7-Day XP Leaderboard.

🌲 Forest — Enter a focus session when you need deep, distraction-free work.

📓 Journal — This is your space. Reflect, plan, celebrate wins, and track your mental journey.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 FIRST STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Head to Daily Quests — add your first task for today
2. Set up a Habit Quest — choose something you want to do every day
3. Visit the Guild Hall — share your Friend Code with someone you know
4. Come back here and write your first journal entry

Remember: Every XP gained, every habit completed, every streak maintained — it all adds up. The best time to start was yesterday. The second best time is RIGHT NOW.

See you at the top, ${name}. ⚔️

— The HabitQuest System`,
        dateString: todayIso
      });

      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        currentStreak: user.currentStreak,
        rankTitle: user.rankTitle,
        avatar: user.avatar,
        friendCode: user.friendCode
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        currentStreak: user.currentStreak,
        rankTitle: user.rankTitle,
        avatar: user.avatar,
        friendCode: user.friendCode
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile (Gamification Dashboard Setup)
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      rankTitle: user.rankTitle,
      avatar: user.avatar,
      friendCode: user.friendCode,
      badges: user.badges
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile (name + avatar)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, avatar } = req.body;

    if (name && name.trim()) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar; // base64 data URL or null

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      rankTitle: user.rankTitle,
      avatar: user.avatar,
      friendCode: user.friendCode,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get aggregated stats for radar chart
// @route   GET /api/auth/stats
// @access  Private
const getProfileStats = async (req, res) => {
  try {
    const Habit = require('../Models/Habit');
    const Activity = require('../Models/Activity');
    const SleepData = require('../Models/SleepData');
    const userId = req.user._id;

    // Habits: completion rate (last 30 days window)
    const allHabits = await Habit.find({ user: userId });
    const completedHabits = allHabits.filter(h => h.status === 'completed').length;
    const habitScore = allHabits.length > 0 ? Math.round((completedHabits / allHabits.length) * 100) : 0;

    // Tasks: completion rate
    const Task = require('../Models/Task');
    const allTasks = await Task.find({ user: userId });
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const taskScore = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

    // Sleep: average hours over last 7 days (optimal = 8h → 100%)
    const sleepLogs = await SleepData.find({ user: userId }).sort({ dateString: -1 }).limit(7);
    const avgSleep = sleepLogs.length > 0
      ? sleepLogs.reduce((sum, s) => sum + s.hours, 0) / sleepLogs.length
      : 0;
    const sleepScore = Math.min(Math.round((avgSleep / 8) * 100), 100);

    // Journal: entries count (cap at 20 = 100%)
    const journalCount = await JournalEntry.countDocuments({ user: userId });
    const journalScore = Math.min(Math.round((journalCount / 20) * 100), 100);

    // Activity: completions in last 7 days (cap at 20 = 100%)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = await Activity.countDocuments({
      user: userId,
      action: 'complete',
      date: { $gte: sevenDaysAgo }
    });
    const activityScore = Math.min(Math.round((recentActivity / 20) * 100), 100);

    // Streak: current streak (cap at 30 = 100%)
    const user = await User.findById(userId);
    const streakScore = Math.min(Math.round(((user.currentStreak || 0) / 30) * 100), 100);

    res.json({
      radarData: [
        { axis: 'Habits', score: habitScore },
        { axis: 'Quests', score: taskScore },
        { axis: 'Sleep', score: sleepScore },
        { axis: 'Journal', score: journalScore },
        { axis: 'Activity', score: activityScore },
        { axis: 'Streak', score: streakScore }
      ],
      totals: {
        habits: allHabits.length,
        completedHabits,
        tasks: allTasks.length,
        completedTasks,
        avgSleep: parseFloat(avgSleep.toFixed(1)),
        journalEntries: journalCount,
        recentCompletions: recentActivity,
        currentStreak: user.currentStreak || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateProfile,
  getProfileStats
};
