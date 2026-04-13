/**
 * Seed Script — Demo User: Prashant12@gmail.com / 12345
 * Creates 7 days of realistic data:
 *  - 10 completed habits/day  (streak = 7, XP awarded)
 *  - 10 completed tasks/day   (XP awarded)
 *  - Sleep log each night     (6–9 hrs, random realistic values)
 *  - Activity records for heatmap intensity
 *  - User XP / level / streak updated accordingly
 *
 * Run: node seedUser.js   (from /Backend folder)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User      = require('./Models/User');
const Habit     = require('./Models/Habit');
const Task      = require('./Models/Task');
const SleepData = require('./Models/SleepData');
const Activity  = require('./Models/Activity');

// ─── Seed Data ──────────────────────────────────────────────
const HABIT_TEMPLATES = [
  { title: 'Morning Meditation',   description: '10 mins of mindfulness',   priority: 'High',   xpReward: 60, icon: 'Brain',    color: '#b373f2' },
  { title: '30-min Workout',       description: 'Full body or cardio',       priority: 'High',   xpReward: 70, icon: 'Dumbbell', color: '#4ae2ff' },
  { title: 'Read 20 Pages',        description: 'Any non-fiction book',      priority: 'Medium', xpReward: 50, icon: 'Book',     color: '#00ffcc' },
  { title: 'Drink 2L of Water',    description: 'Stay hydrated all day',     priority: 'Medium', xpReward: 40, icon: 'Droplet',  color: '#4ae2ff' },
  { title: 'No Social Media',      description: 'Digital detox discipline',  priority: 'High',   xpReward: 80, icon: 'Shield',   color: '#ff3366' },
  { title: 'Cold Shower',          description: 'Builds mental toughness',   priority: 'Medium', xpReward: 50, icon: 'Zap',      color: '#00cfff' },
  { title: 'Journal Entry',        description: 'Reflect on the day',        priority: 'Low',    xpReward: 40, icon: 'PenLine',  color: '#f4d03f' },
  { title: 'Stretch / Yoga',       description: '15 mins flexibility work',  priority: 'Low',    xpReward: 35, icon: 'Activity', color: '#a8e063' },
  { title: 'Learn Something New',  description: 'Course, video, or article', priority: 'Medium', xpReward: 55, icon: 'Lightbulb',color: '#f7971e' },
  { title: 'Sleep by 11 PM',       description: 'Consistent sleep schedule', priority: 'High',   xpReward: 60, icon: 'Moon',     color: '#7f8ef5' },
];

const TASK_TEMPLATES = [
  { title: 'Complete daily standup notes',     priority: 'Medium', xpReward: 15 },
  { title: 'Review and triage email inbox',    priority: 'Low',    xpReward: 10 },
  { title: 'Work on HabitQuest feature',       priority: 'High',   xpReward: 25 },
  { title: 'Plan tomorrow\'s schedule',        priority: 'Medium', xpReward: 15 },
  { title: 'Call / message a friend',          priority: 'Low',    xpReward: 10 },
  { title: 'Cook a healthy meal',              priority: 'Medium', xpReward: 20 },
  { title: 'Clean and organise desk',          priority: 'Low',    xpReward: 10 },
  { title: 'Review weekly goals progress',     priority: 'High',   xpReward: 25 },
  { title: 'Practice DSA / coding problem',    priority: 'High',   xpReward: 30 },
  { title: 'Watch an educational video',       priority: 'Low',    xpReward: 10 },
];

const SLEEP_HOURS = [7.5, 8, 6.5, 7, 8.5, 7, 6.5]; // one per day oldest→newest

// ─── Helpers ──────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function dateStringFor(n) {
  const d = daysAgo(n);
  return d.toISOString().split('T')[0];
}

// ─── Main ──────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  console.log('✅  MongoDB connected');

  // ── 1. Remove existing user + all associated data ──────
  const existing = await User.findOne({ email: 'Prashant12@gmail.com' });
  if (existing) {
    const uid = existing._id;
    await Promise.all([
      Habit.deleteMany({ user: uid }),
      Task.deleteMany({ user: uid }),
      SleepData.deleteMany({ user: uid }),
      Activity.deleteMany({ user: uid }),
      User.deleteOne({ _id: uid }),
    ]);
    console.log('🗑️  Cleared old Prashant data');
  }

  // ── 2. Create User ──────────────────────────────────────
  // Let User.create() trigger the pre-save bcrypt hook (single hash, same as real signup)
  const totalXP = 4970;
  const level   = Math.floor(totalXP / 1000) + 1; // 5

  const user = await User.create({
    name          : 'Prashant',
    email         : 'Prashant12@gmail.com',
    password      : '12345',              // pre-save hook will hash this once ✅
    xp            : totalXP % 1000,
    level,
    currentStreak : 7,
    longestStreak : 7,
    lastActiveDate: new Date(),
    rankTitle     : 'Elite Hunter',
  });
  console.log(`👤  User created — Level ${level}, XP ${totalXP % 1000}/1000, Streak 7`);


  // ── 3. Create Habits (with 7-day streak & completed status) ──
  const habitDocs = [];
  for (const tmpl of HABIT_TEMPLATES) {
    const h = await Habit.create({
      user             : user._id,
      title            : tmpl.title,
      description      : tmpl.description,
      priority         : tmpl.priority,
      xpReward         : tmpl.xpReward,
      icon             : tmpl.icon,
      color            : tmpl.color,
      streak           : 7,
      status           : 'completed',
      lastCompletedDate: daysAgo(0), // today
      frequency        : ['Daily'],
      createdAt        : daysAgo(7),
    });
    habitDocs.push(h);
  }
  console.log(`📋  Created ${habitDocs.length} habits (streak: 7)`);

  // ── 4. Create Tasks (10 completed tasks visible on dashboard) ──
  for (const tmpl of TASK_TEMPLATES) {
    await Task.create({
      user     : user._id,
      title    : tmpl.title,
      priority : tmpl.priority,
      xpReward : tmpl.xpReward,
      status   : 'completed',
      createdAt: daysAgo(0),
    });
  }
  console.log(`✅  Created ${TASK_TEMPLATES.length} completed tasks`);

  // ── 5. Sleep Data — one log per day for 7 days ──────────
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const idx = 6 - dayOffset; // 0..6
    await SleepData.create({
      user      : user._id,
      hours     : SLEEP_HOURS[idx],
      dateString: dateStringFor(dayOffset),
    });
  }
  console.log('😴  Sleep data seeded for 7 days');

  // ── 6. Activity Records — for heatmap intensity (habits + tasks per day) ──
  const activities = [];
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const day = daysAgo(dayOffset);

    // 10 habit completions
    for (const h of habitDocs) {
      activities.push({
        user    : user._id,
        action  : 'completed',
        itemType: 'habit',
        itemName: h.title,
        date    : day,
      });
    }

    // 10 task completions
    for (const t of TASK_TEMPLATES) {
      activities.push({
        user    : user._id,
        action  : 'completed',
        itemType: 'task',
        itemName: t.title,
        date    : day,
      });
    }
  }
  await Activity.insertMany(activities);
  console.log(`🔥  Inserted ${activities.length} activity records (heatmap ready)`);

  // ── Done ────────────────────────────────────────────────
  console.log('\n🎉  Seed complete!');
  console.log('    Email    : Prashant123@gmail.com');
  console.log('    Password : 12345');
  console.log(`    Level    : ${level}`);
  console.log('    Streak   : 7 days');
  console.log('    Habits   : 10 (streak 7)');
  console.log('    Tasks    : 10 (all completed)');
  console.log('    Sleep    : 7 nights logged');
  console.log('    Heatmap  : 7 days × 20 activities = 140 records\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
