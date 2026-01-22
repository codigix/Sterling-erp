const pool = require('../../config/database');
const EmployeeTask = require('../../models/EmployeeTask');
const Notification = require('../../models/Notification');

exports.getEmployeeTasks = async (req, res) => {
  try {
    const { dateFilter, status, type } = req.query;
    const employeeId = req.user.id;
    
    // Fetch tasks from both tables
    let workerTasks = [];
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      workerTasks = await EmployeeTask.getEmployeeTasks(employeeId, today);
    } else {
      workerTasks = await EmployeeTask.findByWorkerId(employeeId);
    }

    // Fetch assigned tasks (from employee_tasks table)
    const assignedTasks = await EmployeeTask.getAssignedTasks(employeeId, { status, type });
    
    // Normalize worker tasks to match the format
    const normalizedWorkerTasks = workerTasks.map(t => ({
      ...t,
      id: t.id,
      title: t.task,
      type: 'worker_task',
      taskType: 'worker'
    }));

    // Combine tasks
    let allTasks = [...normalizedWorkerTasks, ...assignedTasks];
    
    // Apply filters if not already applied by model
    if (status) {
      allTasks = allTasks.filter(t => t.status === status);
    }
    
    if (type) {
      allTasks = allTasks.filter(t => t.type === type);
    }
    
    res.json({ tasks: allTasks, total: allTasks.length });
  } catch (error) {
    console.error('Get employee tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check worker_tasks first (legacy)
    let task = await EmployeeTask.findById(id);
    
    if (task) {
      return res.json({ ...task, taskType: 'worker' });
    }

    // Then check employee_tasks (modern)
    task = await EmployeeTask.getAssignedTaskById(id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ ...task, taskType: 'assigned' });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Check if it's a worker task
    const workerTask = await EmployeeTask.findById(id);
    if (workerTask) {
      await EmployeeTask.updateStatus(id, status);
      
      if (status === 'completed') {
        await Notification.create({
          userId: workerTask.worker_id,
          message: `Task "${workerTask.task}" has been completed`,
          type: 'success',
          relatedId: id,
          relatedType: 'task'
        });
      }
      return res.json({ message: 'Worker task status updated successfully' });
    }

    // Check if it's an assigned task
    const assignedTask = await EmployeeTask.getAssignedTaskById(id);
    if (assignedTask) {
      await EmployeeTask.updateAssignedTaskStatus(id, status, notes);
      
      if (status === 'completed') {
        await Notification.create({
          userId: assignedTask.employee_id,
          message: `Task "${assignedTask.title}" has been completed`,
          type: 'success',
          relatedId: id,
          relatedType: 'employee_task'
        });
      }
      return res.json({ message: 'Assigned task status updated successfully' });
    }
    
    return res.status(404).json({ message: 'Task not found' });
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
