const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  deleteNotification,
  listNotifications,
  markNotificationsRead,
} = require('../controllers/notificationController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(listNotifications));
router.put('/read', asyncHandler(markNotificationsRead));
router.delete('/:id', asyncHandler(deleteNotification));

module.exports = router;
