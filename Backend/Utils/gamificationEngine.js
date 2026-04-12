const User = require('../Models/User');
const Notification = require('../Models/Notification');
const Activity = require('../Models/Activity');

const XP_PER_LEVEL = 1000;

const processGamification = async (userId, actionType, itemType, itemName, xpReward) => {
  let user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let streakUpdated = false;
  let levelUp = false;
  let badgeUnlocked = null;

  if (actionType === 'undo') {
    // 1. Undo XP logic
    user.xp -= xpReward;
    if (user.xp < 0) {
      if (user.level > 1) {
        user.level -= 1;
        user.xp = XP_PER_LEVEL + user.xp;
      } else {
        user.xp = 0;
      }
    }
    
    // (We rely on controllers to undo habit-specific streaks. We don't drop global streak easily unless required).
    await Activity.create({ user: user._id, action: 'undo', itemType, itemName });
    await Notification.create({
      user: user._id,
      title: 'Action Reverted',
      message: `You reverted ${itemName}. -${xpReward} XP.`,
      type: 'info'
    });
  } else {
    // NORMAL ACTION (complete/create)
    // 2. App Streak Logic
    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      
      const diffTime = Math.abs(today - lastActiveDay);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.currentStreak += 1;
        streakUpdated = true;
      } else if (diffDays > 1) {
        user.currentStreak = 1;
        streakUpdated = true;
      }
    } else {
      user.currentStreak = 1;
      streakUpdated = true;
    }
    
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }
    
    user.lastActiveDate = now;

    // 3. XP & Leveling Logic
    user.xp += xpReward;
    while (user.xp >= (user.level * XP_PER_LEVEL)) {
      user.xp -= (user.level * XP_PER_LEVEL);
      user.level += 1;
      levelUp = true;
    }

    // 4. Create Notifications and Activity Log
    if (actionType === 'create') {
      await Notification.create({
        user: user._id,
        title: 'New Quest Added',
        message: `You created: ${itemName}. Let's get it done!`,
        type: 'info'
      });
      await Activity.create({ user: user._id, action: 'create', itemType, itemName });
    } else if (actionType === 'complete') {
      await Notification.create({
        user: user._id,
        title: 'Quest Completed!',
        message: `You finished ${itemName} and gained +${xpReward} XP.`,
        type: 'xp'
      });
      await Activity.create({ user: user._id, action: 'complete', itemType, itemName });

      // Badge Evaluator!
      // 'Early Bird'
      if (now.getHours() <= 8 && !user.badges.includes('Early Bird')) {
        user.badges.push('Early Bird');
        badgeUnlocked = 'Early Bird';
      }
      // 'Warrior'
      if (user.currentStreak >= 7 && !user.badges.includes('Warrior')) {
        user.badges.push('Warrior');
        badgeUnlocked = 'Warrior';
      }
      // 'Centurion'
      if (user.level >= 100 && !user.badges.includes('Centurion')) {
        user.badges.push('Centurion');
        badgeUnlocked = 'Centurion';
      }
    }

    if (streakUpdated) {
      await Notification.create({
        user: user._id,
        title: 'Streak Maintained 🔥',
        message: `Your app streak is now ${user.currentStreak} days!`,
        type: 'streak'
      });
    }

    if (levelUp) {
      await Notification.create({
        user: user._id,
        title: 'LEVEL UP! 🎉',
        message: `Congratulations! You are now Level ${user.level} (${user.rankTitle}).`,
        type: 'level_up'
      });
    }
    
    if (badgeUnlocked) {
      await Notification.create({
        user: user._id,
        title: `Achievement Unlocked: ${badgeUnlocked}! 🏆`,
        message: `You've demonstrated true dedication. Reward unlocked.`,
        type: 'level_up'
      });
    }
  }

  // Update Rank Title regardless of action
  if (user.level >= 100) user.rankTitle = 'Legend';
  else if (user.level >= 50) user.rankTitle = 'Grandmaster';
  else if (user.level >= 25) user.rankTitle = 'Master';
  else if (user.level >= 10) user.rankTitle = 'Knight';
  else if (user.level >= 5) user.rankTitle = 'Squire';
  else user.rankTitle = 'Novice';

  await user.save();

  return {
    level: user.level,
    xp: user.xp,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    rankTitle: user.rankTitle,
    badges: user.badges
  };
};

module.exports = {
  processGamification
};
