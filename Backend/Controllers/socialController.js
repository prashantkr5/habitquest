const User = require('../Models/User');
const Activity = require('../Models/Activity');

// @desc    Add a friend by friend code
// @route   POST /api/social/add-friend
// @access  Private
const addFriend = async (req, res) => {
  try {
    const { friendCode } = req.body;
    
    // Find the friend by code
    const friend = await User.findOne({ friendCode: friendCode.toUpperCase() });
    
    if (!friend) {
      return res.status(404).json({ message: 'Friend code not found. Initialization failed.' });
    }
    
    if (friend._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot add yourself to your own squad.' });
    }
    
    // Add to mutual lists
    const user = await User.findById(req.user.id);
    
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'User is already in your network.' });
    }
    
    user.friends.push(friend._id);
    friend.friends.push(user._id);
    
    await user.save();
    await friend.save();
    
    res.status(200).json({ message: 'Network link established successfully.', friend: { name: friend.name, level: friend.level } });
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
    
    // We want to calculate 'Weekly XP' for the user and all their friends.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const allUsers = [user, ...user.friends];
    
    const leaderboardData = [];
    
    for (let u of allUsers) {
      // Find valid activities for the last 7 days
      const activities = await Activity.find({
        user: u._id,
        createdAt: { $gte: sevenDaysAgo }
      });
      
      // We will estimate weekly xp by assuming a flat rate based on completion vs undo
      // Since activity log doesn't directly store XP change (we could add it later, but we can rough estimate by count)
      // For now, let's just count 'complete' activities.
      let weeklyXp = 0;
      activities.forEach(acc => {
        if (acc.action === 'complete') weeklyXp += 20; // Avg 20
        if (acc.action === 'undo') weeklyXp -= 20;
      });
      
      leaderboardData.push({
        id: u._id,
        name: u.name,
        isMe: u._id.toString() === req.user.id,
        level: u.level,
        rankTitle: u.rankTitle,
        globalStreak: u.currentStreak,
        badges: u.badges || [],
        weeklyXp: Math.max(0, weeklyXp),
        friendCode: u.friendCode
      });
    }
    
    res.status(200).json(leaderboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFriend,
  getLeaderboard
};
