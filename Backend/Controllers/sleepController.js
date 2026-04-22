const SleepData = require('../Models/SleepData');


const logSleep = async (req, res) => {
  const { hours, dateString } = req.body;

  if (hours === undefined || !dateString) {
    return res.status(400).json({ message: 'Need hours and dateString' });
  }

  try {
    let sleepEntry = await SleepData.findOne({ user: req.user.id, dateString });

    if (sleepEntry) {
      sleepEntry.hours = hours;
      await sleepEntry.save();
    } else {
      sleepEntry = await SleepData.create({
        user: req.user.id,
        hours,
        dateString
      });
    }
    res.status(200).json(sleepEntry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSleepData = async (req, res) => {
  try {
    const sleepLogs = await SleepData.find({ user: req.user.id })
      .sort({ dateString: -1 })
      .limit(7); // last 7 din ka data 

    const sorted = sleepLogs.reverse();
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { logSleep, getSleepData };
