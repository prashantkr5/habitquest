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
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'lax', // Prevent CSRF attacks but allow cross-port API fetches
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
        title: 'Welcome to HabitQuest! 👋',
        content: 'This is your completely private, isolated gamification workspace. Complete quests, earn XP, and climb the ranks!',
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
        rankTitle: user.rankTitle
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
        rankTitle: user.rankTitle
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
      rankTitle: user.rankTitle
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
};
