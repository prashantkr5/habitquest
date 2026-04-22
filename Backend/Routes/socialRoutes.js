const express = require('express');
const router = express.Router();
const { addFriend, getLeaderboard, getMyCode, resetMyCode } = require('../Controllers/socialController');
const { protect } = require('../Middleware/auth');

router.post('/add-friend', protect, addFriend);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/my-code', protect, getMyCode);
router.post('/reset-code', protect, resetMyCode);

module.exports = router;
