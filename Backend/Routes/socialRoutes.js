const express = require('express');
const router = express.Router();
const { addFriend, getLeaderboard } = require('../Controllers/socialController');
const { protect } = require('../Middleware/auth');

router.post('/add-friend', protect, addFriend);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
