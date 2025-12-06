const pool = require('../../config/database');
const PurchaseOrder = require('../../models/PurchaseOrder');

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status, vendorId } = req.query;
    const purchaseOrders = await PurchaseOrder.findAll({
      status,
      vendorId
    });
    res.json({ purchaseOrders, total: purchaseOrders.length });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await PurchaseOrder.findById(id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    res.json(purchaseOrder);
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { quotationId, items } = req.body;
    
    if (!quotationId || !items) {
      return res.status(400).json({ message: 'Quotation ID and items are required' });
    }
    
    const purchaseOrderId = await PurchaseOrder.create(quotationId, items);
    res.status(201).json({ message: 'Purchase order created successfully', purchaseOrderId });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    await PurchaseOrder.updateStatus(id, status);
    res.json({ message: 'Purchase order status updated successfully' });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await PurchaseOrder.delete(id);
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPurchaseOrderStats = async (req, res) => {
  try {
    const stats = await PurchaseOrder.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get purchase order stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
