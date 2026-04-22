const User = require('../Models/User');
const Activity = require('../Models/Activity');
const Task = require('../Models/Task');
const Habit = require('../Models/Habit');
const Notification = require('../Models/Notification');

// Generate a unique code seeded from the user's MongoDB _id (guarantees uniqueness)
const generateUniqueCode = (userId) => {
  const idPart = userId.toString().slice(-4).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 4).toUpperCase();
  return (idPart + rand).substring(0, 6);
};

// @desc    Get or generate the logged-in user's friend code
// @route   GET /api/social/my-code
// @access  Private
const getMyCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.friendCode) {
      let code = generateUniqueCode(user._id);
      // Check collision (nearly impossible but safe)
      const collision = await User.exists({ friendCode: code, _id: { $ne: user._id } });
      if (collision) {
        code = code.slice(0, 4) + Math.random().toString(36).substring(2, 4).toUpperCase();
        code = code.substring(0, 6);
      }
      user.friendCode = code;
      await user.save();
    }

    res.json({ friendCode: user.friendCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a friend by friend code
// @route   POST /api/social/add-friend
// @access  Private
const addFriend = async (req, res) => {
  try {
    const { friendCode } = req.body;
    
    const friend = await User.findOne({ friendCode: friendCode.toUpperCase() });
    if (!friend) {
      return res.status(404).json({ message: 'Friend code not found. Check the code and try again.' });
    }
    if (friend._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot add yourself as an ally.' });
    }
    
    const user = await User.findById(req.user.id);
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: `${friend.name} is already your ally!` });
    }
    
    // Mutual connection
    user.friends.push(friend._id);
    friend.friends.push(user._id);
    await user.save();
    await friend.save();

    // Notify the person who was added: "[Name] added you as an ally!"
    await Notification.create({
      user: friend._id,
      title: '🤝 New Ally Connected!',
      message: `${user.name} (${user.rankTitle || 'Novice'}) added you as an ally via your friend code. Check the Guild Hall!`,
      type: 'info'
    });

    // Notify the person who did the adding
    await Notification.create({
      user: user._id,
      title: '✅ Ally Link Established!',
      message: `You are now connected with ${friend.name} (${friend.rankTitle || 'Novice'}). Compete together on the Guild Hall!`,
      type: 'info'
    });
    
    res.status(200).json({ 
      message: `Ally link established! You and ${friend.name} are now connected.`, 
      friend: { name: friend.name, level: friend.level, rankTitle: friend.rankTitle } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Leaderboard
// @route   GET /api/social/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name level xp currentStreak rankTitle friendCode badges');
    
    const sevenDaysAgoDate = new Date();
    sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);

    // For weeklyXp tab: logged-in user + friends
    const friendsAndMe = [user, ...user.friends];
    // For globalStreak tab: fetch ALL registered users
    const allRegisteredUsers = await User.find({}, 'name level xp currentStreak rankTitle friendCode badges');

    const friendIds = friendsAndMe.map(u => u._id);

    // ── BATCH QUERY 1: Sum task XP for ALL friends in one query ──────────────
    const taskXpByUser = await Task.aggregate([
      {
        $match: {
          user: { $in: friendIds },
          status: 'completed',
          updatedAt: { $gte: sevenDaysAgoDate }
        }
      },
      { $group: { _id: '$user', totalXp: { $sum: '$xpReward' } } }
    ]);
    const taskXpMap = {};
    taskXpByUser.forEach(r => { taskXpMap[r._id.toString()] = r.totalXp || 0; });

    // ── BATCH QUERY 2: Sum habit XP for ALL friends in one query ─────────────
    const habitXpByUser = await Habit.aggregate([
      {
        $match: {
          user: { $in: friendIds },
          status: 'completed',
          updatedAt: { $gte: sevenDaysAgoDate }
        }
      },
      { $group: { _id: '$user', totalXp: { $sum: '$xpReward' } } }
    ]);
    const habitXpMap = {};
    habitXpByUser.forEach(r => { habitXpMap[r._id.toString()] = r.totalXp || 0; });

    const leaderboardData = [];

    for (let u of friendsAndMe) {
      const uid = u._id.toString();
      const weeklyXp = (taskXpMap[uid] || 0) + (habitXpMap[uid] || 0);

      leaderboardData.push({
        id: u._id,
        name: u.name,
        isMe: uid === req.user.id,
        level: u.level,
        rankTitle: u.rankTitle,
        globalStreak: u.currentStreak,
        badges: u.badges || [],
        weeklyXp: Math.max(0, weeklyXp),
        friendCode: u.friendCode,
        includeInGlobal: true
      });
    }

    // Add all other registered users that are NOT already in the list (for global streak view)
    const existingIds = new Set(leaderboardData.map(e => e.id.toString()));
    for (let u of allRegisteredUsers) {
      if (!existingIds.has(u._id.toString())) {
        leaderboardData.push({
          id: u._id,
          name: u.name,
          isMe: u._id.toString() === req.user.id,
          level: u.level,
          rankTitle: u.rankTitle,
          globalStreak: u.currentStreak,
          badges: u.badges || [],
          weeklyXp: null, // Not calculated for non-friends
          friendCode: u.friendCode,
          includeInGlobal: true,
          isFriend: false
        });
      }
    }

    res.status(200).json(leaderboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: wipe all friend codes so each user gets a new unique one on next visit
// @route   POST /api/social/reset-codes
// @access  Private (any user triggers their own reset)
const resetMyCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.friendCode = undefined;
    await user.save();
    // Generate a new unique code immediately
    let code = generateUniqueCode(user._id);
    const collision = await User.exists({ friendCode: code, _id: { $ne: user._id } });
    if (collision) code = code.slice(0, 4) + Math.random().toString(36).substring(2, 4).toUpperCase();
    user.friendCode = code.substring(0, 6);
    await user.save();
    res.json({ friendCode: user.friendCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFriend,
  getLeaderboard,
  getMyCode,
  resetMyCode
};
