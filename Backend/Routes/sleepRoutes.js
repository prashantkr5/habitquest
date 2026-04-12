const express = require('express');
const router = express.Router();
const { logSleep, getSleepData } = require('../Controllers/sleepController');
const { protect } = require('../Middleware/auth');

router.route('/')
  .post(protect, logSleep)
  .get(protect, getSleepData);

module.exports = router;
