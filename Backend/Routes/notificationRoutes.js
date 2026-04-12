const express = require('express');
const router = express.Router();
const notificationController = require('../Controllers/notificationController');
const { protect } = require('../Middleware/auth');

router.get('/', protect, notificationController.getNotifications);
router.put('/read', protect, notificationController.markAsRead);

module.exports = router;
