const cron = require('node-cron');
const User = require('../Models/User');
const Activity = require('../Models/Activity');
const JournalEntry = require('../Models/JournalEntry');

const startCronJobs = () => {
  // Run precisely at midnight every day
  // Syntax: '0 0 * * *'
  cron.schedule('0 0 * * *', async () => {
    console.log('Running Midnight Cron: Generating Daily Journal Summaries for all users...');

    try {
      const users = await User.find({});

      const today = new Date();
      // We are summarizing yesterday essentially if it runs exactly at midnight
      // But let's grab anything from the last 24 hours.
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      const dateString = today.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      for (const user of users) {
        // Fetch last 24h activities
        const activities = await Activity.find({
          user: user._id,
          date: { $gte: yesterday, $lte: today }
        });

        if (activities.length === 0) {
          // Skip creating a journal if they did absolutely nothing
          continue;
        }

        let createdCount = 0;
        let completedCount = 0;
        let itemsCompleted = [];

        activities.forEach(act => {
          if (act.action === 'create') createdCount++;
          if (act.action === 'complete') {
            completedCount++;
            if (act.itemName) itemsCompleted.push(act.itemName);
          }
        });

        // Generate magical text
        const content = `System Pulse Report for last 24 hours:\n\n` +
          `• You added ${createdCount} new quests to your journey.\n` +
          `• You successfully conquered ${completedCount} quests.\n\n` +
          `${itemsCompleted.length > 0 ? `Highlights: ${itemsCompleted.join(', ')}` : ''}\n\n` +
          `Your active streak is ${user.currentStreak} Days. Keep pushing forward!`;

        await JournalEntry.create({
          user: user._id,
          title: 'Auto-Summary: ' + dateString,
          content: content,
          dateString: today.toISOString().split('T')[0] // or similar string expected by frontend
        });
      }

      console.log('Midnight Cron Job Complete - Journals Generated.');
    } catch (err) {
      console.error('Error running cron job:', err);
    }
  });
};

module.exports = startCronJobs;
