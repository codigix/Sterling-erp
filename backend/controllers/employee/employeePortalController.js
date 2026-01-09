const Employee = require('../../models/Employee');
const EmployeeTask = require('../../models/EmployeeTask');
const Department = require('../../models/Department');
const Attendance = require('../../models/Attendance');
const CompanyUpdate = require('../../models/CompanyUpdate');
const AlertsNotification = require('../../models/AlertsNotification');
const ManufacturingStage = require('../../models/ManufacturingStage');
const RootCard = require('../../models/RootCard');
const ProductionPlan = require('../../models/ProductionPlan');
const bcrypt = require('bcryptjs');

exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({ message: 'Department ID is required' });
    }

    const employees = await Employee.findByDepartmentId(departmentId);
    
    const formatted = employees.map(emp => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      email: emp.email,
      designation: emp.designation,
      department: emp.department_name || emp.department,
      departmentId: emp.department_id,
      roleId: emp.role_id,
      role: emp.role_name,
      status: emp.status
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const stats = await EmployeeTask.getStatsByEmployee(employeeId);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const workerTasks = await EmployeeTask.getEmployeeTasks(employeeId);
    const assignedTasks = await EmployeeTask.getAssignedTasks(employeeId, {});

    const normalizedWorkerTasks = workerTasks.map(t => ({
      id: t.id,
      title: t.task,
      description: `${t.stage_name || 'Unknown'} - Production Stage`,
      type: 'worker_task',
      status: t.status,
      priority: t.priority || 'medium',
      project_id: t.project_id,
      project_name: t.project_name,
      project_code: t.project_code,
      root_card_id: t.root_card_id,
      root_card_title: t.root_card_title,
      stage_name: t.stage_name,
      sales_order_id: t.sales_order_id,
      po_number: t.po_number,
      customer: t.customer,
      created_at: t.created_at,
      due_date: t.due_date,
      taskType: 'worker'
    }));

    const normalizedAssignedTasks = assignedTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.type,
      status: t.status,
      priority: t.priority || 'medium',
      project_id: t.project_id,
      project_name: t.project_name,
      project_code: t.project_code,
      root_card_title: t.root_card_title,
      stage_name: t.stage_name,
      assigned_by: t.assigned_by,
      due_date: t.due_date,
      notes: t.notes,
      created_at: t.created_at,
      started_at: t.started_at,
      completed_at: t.completed_at,
      taskType: 'assigned'
    }));

    const allTasks = [...normalizedWorkerTasks, ...normalizedAssignedTasks];

    res.json(allTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const attendance = await Attendance.findByEmployeeId(employeeId);
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeProjects = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const tasks = await EmployeeTask.getEmployeeTasks(employeeId);
    const projects = [...new Map(tasks.map(t => [t.project_id, t])).values()];

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeAlerts = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const alerts = await AlertsNotification.findByEmployeeId(employeeId);
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCompanyUpdates = async (req, res) => {
  try {
    const updates = await CompanyUpdate.findAll();
    res.json(updates);
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.assignTaskToEmployee = async (req, res) => {
  try {
    const { employeeId, title, description, type, priority, dueDate, notes } = req.body;

    if (!employeeId || !title) {
      return res.status(400).json({ message: 'Employee ID and title are required' });
    }

    const taskId = await EmployeeTask.createAssignedTask(employeeId, {
      title,
      description,
      type,
      priority,
      dueDate,
      notes
    });

    const task = await EmployeeTask.getAssignedTaskById(taskId);

    res.status(201).json({
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAssignedTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, type, priority } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const tasks = await EmployeeTask.getAssignedTasks(employeeId, { status, type, priority });
    res.json(tasks);
  } catch (error) {
    console.error('Get assigned tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAssignedTasksStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const stats = await EmployeeTask.getAssignedTasksStats(employeeId);
    res.json(stats);
  } catch (error) {
    console.error('Get assigned tasks stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body;

    if (!taskId || !status) {
      return res.status(400).json({ message: 'Task ID and status are required' });
    }

    let task = await EmployeeTask.getAssignedTaskById(taskId);
    if (!task) {
      task = await EmployeeTask.findById(taskId);
    }

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.employee_id) {
      await EmployeeTask.updateAssignedTaskStatus(taskId, status, notes);
      const updatedTask = await EmployeeTask.getAssignedTaskById(taskId);
      res.json({
        message: 'Task status updated successfully',
        data: updatedTask
      });
    } else {
      await EmployeeTask.updateStatus(taskId, status);
      const updatedTask = await EmployeeTask.findById(taskId);
      res.json({
        message: 'Task status updated successfully',
        data: updatedTask
      });
    }
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteAssignedTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await EmployeeTask.getAssignedTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await EmployeeTask.deleteAssignedTask(taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteWorkerTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await EmployeeTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await EmployeeTask.deleteWorkerTask(taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete worker task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { firstName, lastName, designation } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (designation) updateData.designation = designation;

    if (Object.keys(updateData).length > 0) {
      await Employee.update(employeeId, updateData);
    }

    const updatedEmployee = await Employee.findById(employeeId);

    res.json({
      message: 'Profile updated successfully',
      employee: {
        id: updatedEmployee.id,
        name: `${updatedEmployee.first_name} ${updatedEmployee.last_name}`,
        email: updatedEmployee.email,
        designation: updatedEmployee.designation,
        department: updatedEmployee.department_name,
        role: updatedEmployee.role_name
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!employeeId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Employee ID, current password, and new password are required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const passwordMatch = await Employee.verifyPassword(currentPassword, employee.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Employee.update(employeeId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
