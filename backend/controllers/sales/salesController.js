const pool = require('../../config/database');
const SalesOrder = require('../../models/SalesOrder');

exports.getSalesOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const orders = await SalesOrder.findAll({ status, search });
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
    orderDate,
    dueDate,
    total,
    currency,
    priority,
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

    const salesOrderId = await SalesOrder.create({
      customer: clientName,
      poNumber,
      orderDate,
      dueDate,
      total,
      currency,
      priority,
      items,
      documents,
      notes,
      projectScope,
      status: 'pending',
      createdBy
    });

    const createdOrder = await SalesOrder.findById(salesOrderId);

    res.status(201).json({
      message: 'Sales order created successfully',
      order: createdOrder
    });
  } catch (error) {
    console.error('Create sales order error:', error.message);
    console.error('SQL Error:', error.sql);
    res.status(500).json({ message: error.message || 'Failed to create sales order' });
  }
};

exports.updateSalesOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await SalesOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    await SalesOrder.updateStatus(id, status);

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update sales order status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};
