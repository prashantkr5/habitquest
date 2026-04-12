const Activity = require('../Models/Activity');

exports.getHeatmapData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 21); // exactly 21 days (3 weeks grid)
    pastDate.setHours(0, 0, 0, 0);

    const activitiesHabit = await Activity.find({
      user: req.user._id,
      date: { $gte: pastDate, $lte: today },
      action: 'complete',
      itemType: 'habit'
    });

    const activitiesTask = await Activity.find({
      user: req.user._id,
      date: { $gte: pastDate, $lte: today },
      action: 'complete',
      itemType: 'task'
    });

    const buildMap = (acts) => {
      const map = {};
      for (let i = 0; i < 21; i++) {
          const d = new Date();
          d.setDate(today.getDate() - (20 - i));
          const dayKey = d.toISOString().split('T')[0];
          map[dayKey] = 0;
      }
      acts.forEach(act => {
        const dayKey = act.date.toISOString().split('T')[0];
        if(map[dayKey] !== undefined) map[dayKey] += 1;
      });
      return Object.keys(map).map((date, index) => {
        let count = map[date];
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        if (count >= 3 && count <= 5) level = 2;
        if (count >= 6 && count <= 8) level = 3;
        if (count > 8) level = 4;
        return { id: index, level, date, count };
      });
    };

    res.json({
      heatmapHabit: buildMap(activitiesHabit),
      heatmapTask: buildMap(activitiesTask)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 7);
    pastDate.setHours(0, 0, 0, 0);

    const activities = await Activity.find({
      user: req.user._id,
      date: { $gte: pastDate, $lte: today }
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
