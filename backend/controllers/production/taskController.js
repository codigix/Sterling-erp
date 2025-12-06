const pool = require('../../config/database');
const EmployeeTask = require('../../models/EmployeeTask');
const Notification = require('../../models/Notification');

exports.getEmployeeTasks = async (req, res) => {
  try {
    const { dateFilter, status } = req.query;
    let tasks;
    
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      tasks = await EmployeeTask.getEmployeeTasks(req.user.id, today);
    } else if (dateFilter === 'week') {
      tasks = await EmployeeTask.findAll({ workerId: req.user.id });
    } else if (dateFilter === 'month') {
      tasks = await EmployeeTask.findAll({ workerId: req.user.id });
    } else {
      tasks = await EmployeeTask.findByWorkerId(req.user.id);
    }
    
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }
    
    res.json({ tasks, total: tasks.length });
  } catch (error) {
    console.error('Get employee tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await EmployeeTask.findById(id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const task = await EmployeeTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await EmployeeTask.updateStatus(id, status);
    
    if (status === 'completed') {
      await Notification.create({
        userId: task.worker_id,
        message: `Task "${task.task}" has been completed`,
        type: 'success',
        relatedId: id,
        relatedType: 'task'
      });
    }
    
    res.json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addTaskLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { log } = req.body;
    
    if (!log) {
      return res.status(400).json({ message: 'Log is required' });
    }
    
    await EmployeeTask.addLog(id, log);
    res.json({ message: 'Task log added successfully' });
  } catch (error) {
    console.error('Add task log error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskStatistics = async (req, res) => {
  try {
    const stats = await EmployeeTask.getStatsByEmployee(req.user.id);
    res.json(stats || { total: 0, pending: 0, in_progress: 0, completed: 0 });
  } catch (error) {
    console.error('Get task statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
