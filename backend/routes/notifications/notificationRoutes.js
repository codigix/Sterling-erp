const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const notificationController = require('../../controllers/notifications/notificationController');

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.post('/', roleMiddleware('Admin'), notificationController.createNotification);
router.get('/:id', notificationController.getNotificationById);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-all/read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.get('/unread/count', notificationController.getUnreadCount);

module.exports = router;
