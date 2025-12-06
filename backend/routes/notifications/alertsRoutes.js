const express = require('express');
const alertsNotificationController = require('../../controllers/notifications/alertsNotificationController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', alertsNotificationController.createAlert);
router.get('/:id', alertsNotificationController.getAlert);
router.get('/user/:userId', alertsNotificationController.getUserAlerts);
router.get('/user/:userId/unread-count', alertsNotificationController.getUnreadCount);
router.get('/user/:userId/stats', alertsNotificationController.getAlertStats);
router.patch('/:id/read', alertsNotificationController.markAsRead);
router.patch('/user/:userId/read-all', alertsNotificationController.markAllAsRead);
router.delete('/:id', alertsNotificationController.deleteAlert);

module.exports = router;
