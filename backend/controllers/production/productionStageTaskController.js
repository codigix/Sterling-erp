const ProductionStageTask = require('../../models/ProductionStageTask');
const AlertsNotification = require('../../models/AlertsNotification');

const productionStageTaskController = {
  async createTask(req, res) {
    try {
      const { productionStageId, employeeId, taskName, description, priority, notes } = req.body;

      if (!productionStageId || !employeeId || !taskName) {
        return res.status(400).json({ message: 'Production stage ID, employee ID, and task name are required' });
      }

      const taskId = await ProductionStageTask.create({
        productionStageId,
        employeeId,
        taskName,
        description,
        status: 'to_do',
        priority: priority || 'medium',
        notes
      });

      res.status(201).json({
        message: 'Task created successfully',
        taskId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating task', error: error.message });
    }
  },

  async getTask(req, res) {
    try {
      const { id } = req.params;
      const task = await ProductionStageTask.findById(id);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching task', error: error.message });
    }
  },

  async getEmployeeTasks(req, res) {
    try {
      const { employeeId } = req.params;
      const { status, productionPlanId, dateFilter } = req.query;

      const filters = {};
      if (status) {
        filters.status = status;
      }
      if (productionPlanId) {
        filters.productionPlanId = productionPlanId;
      }
      if (dateFilter) {
        filters.dateFilter = dateFilter;
      }

      const tasks = await ProductionStageTask.findByEmployeeId(employeeId, filters);
      res.json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching employee tasks', error: error.message });
    }
  },

  async getAllTasks(req, res) {
    try {
      const { status, employeeId, productionStageId } = req.query;
      const filters = {};

      if (status && status !== 'all') {
        filters.status = status;
      }
      if (employeeId) {
        filters.employeeId = employeeId;
      }
      if (productionStageId) {
        filters.productionStageId = productionStageId;
      }

      const tasks = await ProductionStageTask.findAll(filters);
      res.json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
  },

  async updateTaskStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, cancelReason } = req.body;

      if (!['to_do', 'in_progress', 'pause', 'done', 'cancel'].includes(status)) {
        return res.status(400).json({ message: 'Invalid task status' });
      }

      const task = await ProductionStageTask.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const updates = {};

      if (status === 'in_progress' && task.status !== 'in_progress') {
        updates.started_date = new Date();
      }

      if (status === 'done') {
        updates.completed_date = new Date();
      }

      if (status === 'cancel') {
        updates.cancel_reason = cancelReason || null;
      }

      await ProductionStageTask.updateStatus(id, status, updates);

      res.json({ message: 'Task status updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating task status', error: error.message });
    }
  },

  async pauseTask(req, res) {
    try {
      const { id } = req.params;
      const { pauseDuration } = req.body;

      const task = await ProductionStageTask.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await ProductionStageTask.addPause(id, pauseDuration || 0);
      await ProductionStageTask.updateStatus(id, 'pause');

      res.json({ message: 'Task paused successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error pausing task', error: error.message });
    }
  },

  async getEmployeeStats(req, res) {
    try {
      const { employeeId } = req.params;
      const stats = await ProductionStageTask.getEmployeeStats(employeeId);
      res.json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching employee stats', error: error.message });
    }
  },

  async getProductionStageStats(req, res) {
    try {
      const { productionStageId } = req.params;
      const stats = await ProductionStageTask.getProductionStageStats(productionStageId);
      res.json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching production stage stats', error: error.message });
    }
  }
};

module.exports = productionStageTaskController;
