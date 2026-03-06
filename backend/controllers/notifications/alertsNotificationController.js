const AlertsNotification = require('../../models/AlertsNotification');
const pool = require('../../config/database');

const alertsNotificationController = {
  async createAlert(req, res) {
    try {
      const { userId, fromUserId, alertType, message, relatedTable, relatedId, priority } = req.body;

      if (!userId || !message) {
        return res.status(400).json({ message: 'User ID and message are required' });
      }

      const alertId = await AlertsNotification.create({
        userId,
        fromUserId,
        alertType,
        message,
        relatedTable,
        relatedId,
        priority
      });

      res.status(201).json({
        message: 'Alert created successfully',
        alertId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating alert', error: error.message });
    }
  },

  async getAlert(req, res) {
    try {
      const { id } = req.params;
      const alert = await AlertsNotification.findById(id);

      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      res.json(alert);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching alert', error: error.message });
    }
  },

  async getUserAlerts(req, res) {
    try {
      const { userId: inputId } = req.params;
      const { isRead, alertType, priority, limit } = req.query;

      // Resolve userId using robust model logic
      let userId = await AlertsNotification.resolveUserId(inputId);

      const filters = {};
      if (isRead !== undefined) {
        filters.isRead = isRead === 'true';
      }
      if (alertType && alertType !== 'all') {
        filters.alertType = alertType;
      }
      if (priority && priority !== 'all') {
        filters.priority = priority;
      }
      if (limit) {
        filters.limit = parseInt(limit);
      }

      // If userId resolution failed and it's not numeric, return empty
      if (!userId || (isNaN(userId) && String(userId).includes('.'))) {
        return res.json([]);
      }

      const alerts = await AlertsNotification.findByUserId(userId, filters);
      
      // Transform raw alerts to match frontend expectations (especially for NotificationBell)
      const transformedAlerts = alerts.map(alert => ({
        ...alert,
        id: alert.id,
        title: alert.alert_type ? alert.alert_type.replace(/_/g, ' ').toUpperCase() : 'Notification',
        message: alert.message,
        type: alert.priority === 'high' ? 'error' : alert.priority === 'medium' ? 'warning' : 'info',
        alertType: alert.alert_type,
        timestamp: alert.created_at,
        created_at: alert.created_at, // Keep original for groupNotifications
        read: !!alert.is_read,
        is_read: !!alert.is_read, // Keep original for filter(n => !n.is_read)
        priority: alert.priority,
        link: alert.link,
        relatedTable: alert.related_table,
        relatedId: alert.related_id,
        sender: alert.sender_name || 'System'
      }));

      res.json(transformedAlerts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching alerts', error: error.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const alert = await AlertsNotification.findById(id);
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      await AlertsNotification.markAsRead(id);
      res.json({ message: 'Alert marked as read' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error marking alert as read', error: error.message });
    }
  },

  async markAllAsRead(req, res) {
    try {
      const { userId } = req.params;

      await AlertsNotification.markAllAsRead(userId);
      res.json({ message: 'All alerts marked as read' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error marking alerts as read', error: error.message });
    }
  },

  async deleteAlert(req, res) {
    try {
      const { id } = req.params;

      const alert = await AlertsNotification.findById(id);
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }

      await AlertsNotification.delete(id);
      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting alert', error: error.message });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const { userId: inputId } = req.params;
      let userId = await AlertsNotification.resolveUserId(inputId);

      const unreadCount = await AlertsNotification.getUnreadCount(userId);
      res.json({ unreadCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching unread count', error: error.message });
    }
  },

  async getAlertStats(req, res) {
    try {
      const { userId: inputId } = req.params;
      let userId = await AlertsNotification.resolveUserId(inputId);

      const stats = await AlertsNotification.getStats(userId);
      res.json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching alert stats', error: error.message });
    }
  }
};

module.exports = alertsNotificationController;
