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

      // Resolve userId if it might be an employeeId
      let userId = inputId;
      try {
        const [emps] = await pool.execute("SELECT id, email FROM employees WHERE id = ?", [inputId]);
        if (emps.length > 0) {
          const [users] = await pool.execute("SELECT id FROM users WHERE email = ?", [emps[0].email]);
          if (users.length > 0) {
            userId = users[0].id;
            console.log(`[getUserAlerts] Resolved employeeId ${inputId} to userId ${userId}`);
          }
        }
      } catch (err) {
        console.warn('[getUserAlerts] ID resolution error:', err.message);
      }

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

      // If userId is still non-numeric and doesn't exist in our DB, return empty results
      if (isNaN(userId) && String(userId).startsWith('demo-')) {
        return res.json([]);
      }

      const alerts = await AlertsNotification.findByUserId(userId, filters);
      res.json(alerts);
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
      const { userId } = req.params;
      
      if (isNaN(userId) && String(userId).startsWith('demo-')) {
        return res.json({ unreadCount: 0 });
      }

      const unreadCount = await AlertsNotification.getUnreadCount(userId);
      res.json({ unreadCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching unread count', error: error.message });
    }
  },

  async getAlertStats(req, res) {
    try {
      const { userId } = req.params;

      if (isNaN(userId) && String(userId).startsWith('demo-')) {
        return res.json({
          total_alerts: 0,
          unread: 0,
          task_blocked: 0,
          status_update: 0,
          delay_alert: 0,
          material_shortage: 0,
          quality_issue: 0
        });
      }

      const stats = await AlertsNotification.getStats(userId);
      res.json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching alert stats', error: error.message });
    }
  }
};

module.exports = alertsNotificationController;
