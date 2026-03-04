const Role = require('../../models/Role');
const DepartmentTask = require('../../models/DepartmentTask');
const Department = require('../../models/Department');

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRoleByName = async (req, res) => {
  try {
    const { roleName } = req.params;

    if (!roleName) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    let role = await Role.findByName(roleName);
    
    if (!role) {
      const formattedName = roleName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      role = await Role.findByName(formattedName);
    }

    if (!role) {
      const allRoles = await Role.findAll();
      const matchedRole = allRoles.find(r => 
        r.name.toLowerCase() === roleName.toLowerCase() ||
        r.name.toLowerCase() === roleName.replace(/_/g, ' ').toLowerCase()
      );
      role = matchedRole;
    }

    if (!role) {
      return res.status(404).json({ message: `Role '${roleName}' not found` });
    }

    res.json({ roleId: role.id, role });
  } catch (error) {
    console.error('Get role by name error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTasksByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { status, priority, excludeWorkflow } = req.query;

    if (!roleId) {
      return res.status(400).json({ message: 'Role ID is required' });
    }

    const tasks = await DepartmentTask.getDepartmentTasks(
      roleId, 
      status, 
      priority, 
      excludeWorkflow === 'true'
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await DepartmentTask.getDepartmentTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const {
      roleId,
      title,
      description,
      priority = 'medium',
      status = 'pending',
      rootCardId = null,
      isWorkflowCustomTask = false
    } = req.body;
    const userId = req.user?.id;

    if (!roleId || !title) {
      return res.status(400).json({ message: 'Role ID and title are required' });
    }

    const taskData = {
      role_id: roleId,
      task_title: title,
      task_description: description || null,
      priority,
      status,
      assigned_by: userId,
      root_card_id: rootCardId,
      notes: isWorkflowCustomTask ? { is_workflow_custom: true } : null
    };

    const result = await DepartmentTask.createDepartmentTask(taskData);

    res.status(201).json({
      message: 'Task created successfully',
      taskId: result.insertId
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, notes } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const updates = {};
    if (title) updates.task_title = title;
    if (description) updates.task_description = description;
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (notes) updates.notes = notes;

    await DepartmentTask.updateDepartmentTask(taskId, updates);

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    await DepartmentTask.deleteDepartmentTask(taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRoleStats = async (req, res) => {
  try {
    const { roleId } = req.params;

    if (!roleId) {
      return res.status(400).json({ message: 'Role ID is required' });
    }

    const stats = await DepartmentTask.getDepartmentTaskStats(roleId);

    res.json(stats);
  } catch (error) {
    console.error('Get role stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
