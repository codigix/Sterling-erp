const pool = require('../../config/database');
const DepartmentTask = require('../../models/DepartmentTask');

exports.getDepartmentTasks = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { status, priority } = req.query;

    if (!roleId) {
      return res.status(400).json({ message: 'Role ID is required' });
    }

    let tasks = await DepartmentTask.getDepartmentTasks(roleId, status, priority);

    const formatted = tasks.map(task => ({
      id: task.id,
      taskId: task.id,
      title: task.task_title,
      description: task.task_description || 'No description',
      status: task.status,
      priority: task.priority || 'medium',
      notes: task.notes || null,
      rootCard: {
        id: task.root_card_id,
        title: task.root_card_title,
        code: task.root_card_code,
        priority: task.root_card_priority
      },
      project: task.project_id ? {
        id: task.project_id,
        name: task.project_name,
        code: task.project_code
      } : null,
      salesOrder: task.sales_order_id ? {
        id: task.sales_order_id,
        poNumber: task.po_number,
        customer: task.customer,
        total: task.total,
        orderDate: task.order_date,
        dueDate: task.due_date
      } : null,
      department: {
        roleId: task.role_id,
        roleName: task.role_name
      },
      assignedBy: task.assigned_by_name || 'System',
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get department tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDepartmentTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await DepartmentTask.getDepartmentTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const formatted = {
      id: task.id,
      title: task.task_title,
      description: task.task_description,
      status: task.status,
      priority: task.priority,
      rootCard: {
        id: task.root_card_id,
        title: task.root_card_title,
        code: task.root_card_code,
        priority: task.root_card_priority
      },
      project: task.project_id ? {
        id: task.project_id,
        name: task.project_name,
        code: task.project_code
      } : null,
      salesOrder: task.sales_order_id ? {
        id: task.sales_order_id,
        poNumber: task.po_number,
        customer: task.customer,
        total: task.total,
        orderDate: task.order_date,
        dueDate: task.due_date
      } : null,
      department: {
        roleId: task.role_id,
        roleName: task.role_name
      },
      assignedBy: task.assigned_by_name,
      notes: task.notes ? JSON.parse(task.notes) : null,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };

    res.json(formatted);
  } catch (error) {
    console.error('Get department task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createDepartmentTask = async (req, res) => {
  try {
    const { title, description, priority = 'medium', status = 'pending', rootCardId, roleId, salesOrderId } = req.body;

    if (!title || !roleId) {
      return res.status(400).json({ message: 'Title and role ID are required' });
    }

    // If rootCardId is not provided but salesOrderId is, try to find the root card
    let finalRootCardId = rootCardId;
    let finalSalesOrderId = salesOrderId;

    if (!finalRootCardId && salesOrderId) {
      const RootCard = require('../../models/RootCard');
      const rootCard = await RootCard.findBySalesOrderId(salesOrderId);
      if (rootCard) {
        finalRootCardId = rootCard.id;
      }
    }

    // If rootCardId is provided but salesOrderId is not, try to find the sales order
    if (finalRootCardId && !finalSalesOrderId) {
      const RootCard = require('../../models/RootCard');
      const rootCard = await RootCard.findById(finalRootCardId);
      if (rootCard && rootCard.sales_order_id) {
        finalSalesOrderId = rootCard.sales_order_id;
      }
    }

    const result = await DepartmentTask.createDepartmentTask({
      root_card_id: finalRootCardId || null,
      role_id: roleId,
      task_title: title,
      task_description: description || null,
      priority,
      status,
      assigned_by: req.user?.id || null,
      notes: null,
      sales_order_id: finalSalesOrderId || null
    });

    if (!result.insertId) {
      return res.status(400).json({ message: 'Failed to create task' });
    }

    const newTask = await DepartmentTask.getDepartmentTaskById(result.insertId);

    const formatted = {
      id: newTask.id,
      title: newTask.task_title,
      description: newTask.task_description || 'No description',
      status: newTask.status,
      priority: newTask.priority || 'medium',
      rootCard: newTask.root_card_id ? {
        id: newTask.root_card_id,
        title: newTask.root_card_title,
        code: newTask.root_card_code,
        priority: newTask.root_card_priority
      } : null,
      project: newTask.project_id ? {
        id: newTask.project_id,
        name: newTask.project_name,
        code: newTask.project_code
      } : null,
      salesOrder: newTask.sales_order_id ? {
        id: newTask.sales_order_id,
        poNumber: newTask.po_number,
        customer: newTask.customer,
        total: newTask.total,
        orderDate: newTask.order_date,
        dueDate: newTask.due_date
      } : null,
      department: {
        roleId: newTask.role_id,
        roleName: newTask.role_name
      },
      assignedBy: newTask.assigned_by_name || 'System',
      createdAt: newTask.created_at,
      updatedAt: newTask.updated_at
    };

    res.status(201).json({
      message: 'Task created successfully',
      task: formatted
    });
  } catch (error) {
    console.error('Create department task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateDepartmentTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, priority, notes } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await DepartmentTask.getDepartmentTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (notes) updates.notes = JSON.stringify(notes);

    const result = await DepartmentTask.updateDepartmentTask(taskId, updates);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to update task' });
    }

    const updatedTask = await DepartmentTask.getDepartmentTaskById(taskId);
    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update department task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDepartmentTaskStats = async (req, res) => {
  try {
    const { roleId } = req.params;

    if (!roleId) {
      return res.status(400).json({ message: 'Role ID is required' });
    }

    const stats = await DepartmentTask.getDepartmentTaskStats(roleId);

    res.json(stats);
  } catch (error) {
    console.error('Get department task stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteDepartmentTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const result = await DepartmentTask.deleteDepartmentTask(taskId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete department task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRoleIdByName = async (req, res) => {
  try {
    const { roleName } = req.params;

    if (!roleName) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    const [rows] = await pool.execute(
      'SELECT id, name FROM roles WHERE LOWER(name) LIKE LOWER(?) LIMIT 1',
      [`%${roleName}%`]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ roleId: rows[0].id, roleName: rows[0].name });
  } catch (error) {
    console.error('Get role ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
