const pool = require('../../config/database');
const SalesOrder = require('../../models/SalesOrder');
const EmployeeTask = require('../../models/EmployeeTask');
const Project = require('../../models/Project');
const RootCard = require('../../models/RootCard');
const { assignTasksFromRootCard } = require('../../utils/taskAssignmentHelper');

exports.getAssignedOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    const [orders] = await pool.execute(
      'SELECT * FROM sales_orders WHERE assigned_to = ? OR created_by = ? ORDER BY created_at DESC',
      [userId, userId]
    );

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      approved: orders.filter(o => o.status === 'approved').length,
      in_progress: orders.filter(o => o.status === 'in_progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
      delivered: orders.filter(o => o.status === 'delivered').length
    };

    res.json({ orders, stats });
  } catch (error) {
    console.error('Get assigned orders error:', error);
    res.status(500).json({ message: 'Failed to load assigned orders' });
  }
};

exports.getSalesOrders = async (req, res) => {
  try {
    const { status, search, includeSteps } = req.query;
    const orders = await SalesOrder.findAll({ 
      status, 
      search,
      includeSteps: includeSteps !== 'false'
    });
    const stats = await SalesOrder.getStats();
    res.json({ orders, stats });
  } catch (error) {
    console.error('Get sales orders error:', error);
    res.status(500).json({ message: 'Failed to load sales orders' });
  }
};

exports.getSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await SalesOrder.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get sales order error:', error);
    res.status(500).json({ message: 'Failed to load sales order' });
  }
};

exports.createSalesOrder = async (req, res) => {
  const {
    clientName,
    poNumber,
    projectName,
    orderDate,
    dueDate,
    total,
    currency,
    priority,
    status,
    items,
    documents,
    notes,
    projectScope
  } = req.body;

  if (!clientName || !poNumber || !orderDate || !total) {
    return res.status(400).json({ message: 'Client, PO number, order date, and total amount are required' });
  }

  if (!dueDate) {
    return res.status(400).json({ message: 'Due date is required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one item is required' });
  }

  try {
    console.log('Received dueDate:', dueDate, 'Type:', typeof dueDate);
    const createdBy = typeof req.user?.id === 'number' ? req.user.id : null;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const salesOrderId = await SalesOrder.create({
        customer: clientName,
        poNumber,
        projectName,
        orderDate,
        dueDate,
        total,
        currency,
        priority,
        items,
        documents,
        notes,
        projectScope,
        status: status || 'pending',
        createdBy
      }, connection);

      const projectCode = `PRJ-${poNumber}-${Date.now()}`;
      const projectId = await Project.create({
        name: projectName || `Project for ${clientName}`,
        code: projectCode,
        salesOrderId,
        clientName,
        poNumber,
        status: 'draft',
        priority: priority || 'medium',
        expectedStart: orderDate,
        expectedEnd: dueDate,
        managerId: createdBy,
        summary: notes
      }, connection);

      const rootCardId = await RootCard.create({
        projectId,
        code: projectCode,
        title: projectName || `Root Card for ${clientName}`,
        status: 'planning',
        priority: priority || 'medium',
        plannedStart: orderDate,
        plannedEnd: dueDate,
        createdBy,
        notes: `Auto-created from Sales Order ${poNumber}`,
        stages: []
      }, connection);

      await connection.commit();

      const createdOrder = await SalesOrder.findById(salesOrderId);

      res.status(201).json({
        message: 'Sales order created successfully',
        order: createdOrder,
        projectId,
        rootCardId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create sales order error:', error.message);
    console.error('SQL Error:', error.sql);
    res.status(500).json({ message: error.message || 'Failed to create sales order' });
  }
};

exports.updateSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      poNumber,
      orderDate,
      dueDate,
      total,
      currency,
      priority,
      projectName,
      status,
      items,
      documents,
      notes,
      projectScope
    } = req.body;

    const order = await SalesOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    const updateData = {
      customer: clientName,
      poNumber,
      projectName,
      orderDate,
      dueDate,
      total,
      currency: currency || 'INR',
      priority,
      status,
      items,
      documents,
      notes,
      projectScope
    };

    await SalesOrder.update(id, updateData);

    const updatedOrder = await SalesOrder.findById(id);

    res.json({
      message: 'Sales order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update sales order error:', error);
    res.status(500).json({ message: 'Failed to update sales order' });
  }
};

exports.updateSalesOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    status = status.toString().trim().toLowerCase();

    const validStatuses = ['pending', 'draft', 'ready_to_start', 'assigned', 'approved', 'in_progress', 'on_hold', 'critical', 'completed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value',
        validStatuses
      });
    }

    const order = await SalesOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    await SalesOrder.updateStatus(id, status);

    if (['assigned', 'ready_to_start', 'in_progress', 'approved'].includes(status)) {
      console.log(`Triggering task assignment for sales order ${id} with status ${status}`);
      await assignTasksFromRootCard(id);
    }

    const updatedOrder = await SalesOrder.findById(id);

    res.json({ 
      message: 'Status updated successfully',
      order: updatedOrder,
      taskAssignmentTriggered: ['assigned', 'ready_to_start', 'in_progress', 'approved'].includes(status)
    });
  } catch (error) {
    console.error('Update sales order status error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ 
      message: 'Failed to update status',
      error: error.message || 'Unknown error'
    });
  }
};

exports.deleteSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await SalesOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    await pool.execute('DELETE FROM sales_orders WHERE id = ?', [id]);

    res.json({ message: 'Sales order deleted successfully' });
  } catch (error) {
    console.error('Delete sales order error:', error);
    res.status(500).json({ message: 'Failed to delete sales order' });
  }
};

exports.assignSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignedAt } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: 'Assignee is required' });
    }

    const order = await SalesOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    await pool.execute(
      'UPDATE sales_orders SET assigned_to = ?, assigned_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [assignedTo, assignedAt || new Date(), id]
    );

    res.json({ message: 'Sales order assigned successfully' });
  } catch (error) {
    console.error('Assign sales order error:', error);
    res.status(500).json({ message: 'Failed to assign sales order' });
  }
};

exports.manuallyAssignTasks = async (req, res) => {
  try {
    const { salesOrderId } = req.params;

    const order = await SalesOrder.findById(salesOrderId);
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    const result = await assignTasksFromRootCard(salesOrderId);

    res.json({ 
      message: result.success ? 'Tasks assigned successfully from root card' : 'No tasks to assign',
      salesOrderId,
      tasksCreated: result.tasksCreated,
      details: result
    });
  } catch (error) {
    console.error('Manually assign tasks error:', error);
    res.status(500).json({ 
      message: 'Failed to assign tasks',
      error: error.message
    });
  }
};

exports.saveDesignDetails = async (req, res) => {
  try {
    const { salesOrderId } = req.params;
    const designDetails = req.body;

    if (!salesOrderId) {
      return res.status(400).json({ message: 'Sales order ID is required' });
    }

    const [result] = await pool.execute(
      'UPDATE sales_orders SET design_details = ? WHERE id = ?',
      [designDetails, salesOrderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    res.json({ 
      message: 'Design details saved successfully',
      data: designDetails 
    });
  } catch (error) {
    console.error('Save design details error:', error);
    res.status(500).json({ 
      message: 'Failed to save design details',
      error: error.message 
    });
  }
};

exports.getDesignDetails = async (req, res) => {
  try {
    const { salesOrderId } = req.params;

    if (!salesOrderId) {
      return res.status(400).json({ message: 'Sales order ID is required' });
    }

    const [rows] = await pool.execute(
      'SELECT design_details FROM sales_orders WHERE id = ?',
      [salesOrderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    const designDetails = rows[0].design_details || null;

    res.json({ 
      data: designDetails || {}
    });
  } catch (error) {
    console.error('Get design details error:', error);
    res.status(500).json({ 
      message: 'Failed to get design details',
      error: error.message 
    });
  }
};
