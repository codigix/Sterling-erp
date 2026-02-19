const SalesManagement = require('../../models/SalesManagement');
const ComprehensiveBOM = require('../../models/ComprehensiveBOM');
const RootCardReal = require('../../models/RootCardReal');
const ClientPODetail = require('../../models/ClientPODetail');
const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');

exports.createSalesOrder = async (req, res) => {
  try {
    const {
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes
    } = req.body;

    const userId = req.user.id;

    if (!bomId || !soNumber || (!customerId && !customerName) || !quantity || !orderDate || !deliveryDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newSoId = await SalesManagement.create({
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes,
      createdBy: userId
    });

    res.status(201).json({
      message: 'Sales Order created successfully',
      id: newSoId
    });
  } catch (error) {
    console.error('Create sales order error:', error.message);
    res.status(500).json({ message: 'Failed to create sales order', error: error.message });
  }
};

exports.getAllSalesOrders = async (req, res) => {
  try {
    const orders = await SalesManagement.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Get sales orders error:', error.message);
    res.status(500).json({ message: 'Failed to fetch sales orders' });
  }
};

exports.getNextSONumber = async (req, res) => {
  try {
    const nextNumber = await SalesManagement.generateNextSONumber();
    res.json({ nextNumber });
  } catch (error) {
    console.error('Get next SO number error:', error.message);
    res.status(500).json({ message: 'Failed to generate next SO number' });
  }
};

exports.getRootCards = async (req, res) => {
  try {
    const rootCards = await RootCardReal.getAll();
    res.json(rootCards);
  } catch (error) {
    console.error('Get root cards error:', error.message);
    res.status(500).json({ message: 'Failed to fetch root cards' });
  }
};

exports.getRootCardDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const rootCard = await RootCardReal.findById(id);
    if (!rootCard) {
      return res.status(404).json({ message: 'Root Card not found' });
    }

    const poDetails = await ClientPODetail.findByRootCardId(id);
    const designDetails = await DesignEngineeringDetail.findByRootCardId(id);
    
    res.json({
      ...rootCard,
      poDetails,
      designDetails
    });
  } catch (error) {
    console.error('Get root card details error:', error.message);
    res.status(500).json({ message: 'Failed to fetch root card details' });
  }
};

exports.getBOMsByRootCard = async (req, res) => {
  try {
    const { id } = req.params;
    const boms = await ComprehensiveBOM.findAllByRootCardId(id);
    // Filter BOMs that are Finished Goods and are either approved or active
    const filteredBoms = boms.filter(bom => 
      (bom.status === 'approved' || bom.status === 'active') && 
      (bom.itemGroup === 'Finished Goods' || bom.itemGroup === 'Finished Good')
    );
    res.json(filteredBoms);
  } catch (error) {
    console.error('Get BOMs by root card error:', error.message);
    res.status(500).json({ message: 'Failed to fetch BOMs for root card' });
  }
};

exports.getApprovedBOMs = async (req, res) => {
  try {
    const approvedBOMs = await ComprehensiveBOM.getApproved('Finished Goods');
    res.json(approvedBOMs);
  } catch (error) {
    console.error('Get approved BOMs error:', error.message);
    res.status(500).json({ message: 'Failed to fetch approved BOMs' });
  }
};

exports.updateSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes
    } = req.body;

    if (!bomId || !soNumber || (!customerId && !customerName) || !quantity || !orderDate || !deliveryDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await SalesManagement.update(id, {
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes
    });

    res.json({ message: 'Sales Order updated successfully' });
  } catch (error) {
    console.error('Update sales order error:', error.message);
    res.status(500).json({ message: 'Failed to update sales order', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await SalesManagement.updateStatus(id, status);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

exports.deleteSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await SalesManagement.delete(id);
    res.json({ message: 'Sales Order deleted successfully' });
  } catch (error) {
    console.error('Delete sales order error:', error.message);
    res.status(500).json({ message: 'Failed to delete sales order' });
  }
};
