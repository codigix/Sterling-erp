const MaterialRequest = require('../../models/MaterialRequest');
const Vendor = require('../../models/Vendor');

exports.createMaterialRequest = async (req, res) => {
  const {
    salesOrderId,
    productionPlanId,
    materialName,
    materialCode,
    quantity,
    unit,
    specification,
    requiredDate,
    priority,
    remarks
  } = req.body;

  if (!salesOrderId || !materialName || !quantity) {
    return res.status(400).json({
      message: 'Sales order ID, material name, and quantity are required'
    });
  }

  try {
    const createdBy = typeof req.user?.id === 'number' ? req.user.id : null;

    const materialRequestId = await MaterialRequest.create({
      salesOrderId,
      productionPlanId,
      materialName: materialName.trim(),
      materialCode: materialCode || null,
      quantity: Number(quantity),
      unit: unit || 'Nos',
      specification: specification || null,
      requiredDate: requiredDate || null,
      priority: priority || 'medium',
      status: 'draft',
      createdBy,
      remarks: remarks || null
    });

    const createdRequest = await MaterialRequest.findById(materialRequestId);

    res.status(201).json({
      message: 'Material request created successfully',
      materialRequest: createdRequest
    });
  } catch (error) {
    console.error('Create material request error:', error.message);
    res.status(500).json({ message: 'Failed to create material request' });
  }
};

exports.getMaterialRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const materialRequest = await MaterialRequest.findById(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Material request not found' });
    }

    const vendors = await MaterialRequest.getVendorsForMaterial(id);

    res.json({
      materialRequest,
      vendors
    });
  } catch (error) {
    console.error('Get material request error:', error.message);
    res.status(500).json({ message: 'Failed to fetch material request' });
  }
};

exports.getMaterialRequestsBySalesOrder = async (req, res) => {
  const { salesOrderId } = req.params;

  try {
    const materialRequests = await MaterialRequest.findBySalesOrder(salesOrderId);

    res.json({
      materialRequests,
      total: materialRequests.length
    });
  } catch (error) {
    console.error('Get material requests error:', error.message);
    res.status(500).json({ message: 'Failed to fetch material requests' });
  }
};

exports.getAllMaterialRequests = async (req, res) => {
  const { status, priority, search, salesOrderId } = req.query;

  try {
    const materialRequests = await MaterialRequest.findAll({
      status,
      priority,
      search,
      salesOrderId
    });

    const stats = await MaterialRequest.getStats();

    res.json({
      materialRequests,
      stats,
      total: materialRequests.length
    });
  } catch (error) {
    console.error('Get all material requests error:', error.message);
    res.status(500).json({ message: 'Failed to fetch material requests' });
  }
};

exports.updateMaterialRequest = async (req, res) => {
  const { id } = req.params;
  const { materialName, quantity, specification, requiredDate, priority, remarks, status } = req.body;

  try {
    const materialRequest = await MaterialRequest.findById(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Material request not found' });
    }

    await MaterialRequest.update(id, {
      materialName,
      quantity,
      specification,
      requiredDate,
      priority,
      status,
      remarks
    });

    const updatedRequest = await MaterialRequest.findById(id);

    res.json({
      message: 'Material request updated successfully',
      materialRequest: updatedRequest
    });
  } catch (error) {
    console.error('Update material request error:', error.message);
    res.status(500).json({ message: 'Failed to update material request' });
  }
};

exports.updateMaterialRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['draft', 'submitted', 'approved', 'ordered', 'received', 'rejected', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const materialRequest = await MaterialRequest.findById(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Material request not found' });
    }

    await MaterialRequest.updateStatus(id, status);

    res.json({ message: 'Material request status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

exports.deleteMaterialRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const materialRequest = await MaterialRequest.findById(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Material request not found' });
    }

    if (materialRequest.status !== 'draft') {
      return res.status(400).json({
        message: 'Only draft material requests can be deleted'
      });
    }

    await MaterialRequest.delete(id);

    res.json({ message: 'Material request deleted successfully' });
  } catch (error) {
    console.error('Delete material request error:', error.message);
    res.status(500).json({ message: 'Failed to delete material request' });
  }
};

exports.addVendorQuote = async (req, res) => {
  const { id } = req.params;
  const { vendorId, quotedPrice, deliveryDays, notes } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: 'Vendor ID is required' });
  }

  try {
    const materialRequest = await MaterialRequest.findById(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Material request not found' });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const vendorQuoteId = await MaterialRequest.addVendor(
      id,
      vendorId,
      quotedPrice,
      deliveryDays,
      notes
    );

    const vendors = await MaterialRequest.getVendorsForMaterial(id);

    res.status(201).json({
      message: 'Vendor quote added successfully',
      vendorQuoteId,
      vendors
    });
  } catch (error) {
    console.error('Add vendor quote error:', error.message);
    res.status(500).json({ message: 'Failed to add vendor quote' });
  }
};

exports.getVendorQuotes = async (req, res) => {
  const { id } = req.params;

  try {
    const materialRequest = await MaterialRequest.findById(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Material request not found' });
    }

    const vendors = await MaterialRequest.getVendorsForMaterial(id);

    res.json({
      materialRequest,
      vendors,
      total: vendors.length
    });
  } catch (error) {
    console.error('Get vendor quotes error:', error.message);
    res.status(500).json({ message: 'Failed to fetch vendor quotes' });
  }
};

exports.selectVendor = async (req, res) => {
  const { id } = req.params;
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: 'Vendor ID is required' });
  }

  try {
    const materialRequest = await MaterialRequest.findById(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Material request not found' });
    }

    await MaterialRequest.selectVendor(id, vendorId);

    const vendors = await MaterialRequest.getVendorsForMaterial(id);

    res.json({
      message: 'Vendor selected successfully',
      vendors
    });
  } catch (error) {
    console.error('Select vendor error:', error.message);
    res.status(500).json({ message: 'Failed to select vendor' });
  }
};
