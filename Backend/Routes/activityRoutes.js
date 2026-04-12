const express = require('express');
const router = express.Router();
const activityController = require('../Controllers/activityController');
const { protect } = require('../Middleware/auth');

router.get('/heatmap', protect, activityController.getHeatmapData);
router.get('/recent', protect, activityController.getRecentActivity);

module.exports = router;
