const MaterialRequest = require('../../models/MaterialRequest');
const Vendor = require('../../models/Vendor');
const pool = require('../../config/database');

exports.createMaterialRequest = async (req, res) => {
  const {
    rootCardId,
    productionPlanId,
    items,
    materialName, // Legacy
    quantity, // Legacy
    unit, // Legacy
    specification, // Legacy
    department,
    purpose,
    targetWarehouseId,
    requiredDate,
    priority,
    remarks
  } = req.body;

  if (!rootCardId || rootCardId === '0' || rootCardId === '') {
    return res.status(400).json({ message: 'Valid Root card ID (Sales Order ID) is required' });
  }

  // Handle legacy single-item requests or new multi-item requests
  let requestItems = items;
  if (!requestItems && materialName && quantity) {
    requestItems = [{
      materialName,
      materialCode: req.body.materialCode,
      quantity,
      unit,
      specification
    }];
  }

  if (!requestItems || !Array.isArray(requestItems) || requestItems.length === 0) {
    return res.status(400).json({ message: 'At least one item is required' });
  }

  try {
    const createdBy = typeof req.user?.id === 'number' ? req.user.id : null;

    const materialRequestId = await MaterialRequest.create({
      rootCardId,
      productionPlanId,
      items: requestItems,
      department,
      purpose,
      targetWarehouseId,
      requiredDate: requiredDate || null,
      priority,
      status: 'draft',
      createdBy,
      remarks
    });

    const createdRequest = await MaterialRequest.findById(materialRequestId);

    res.status(201).json({
      message: 'Material request created successfully',
      materialRequest: createdRequest
    });
  } catch (error) {
    console.error('Create material request error:', error.message);
    res.status(500).json({ message: 'Failed to create material request', error: error.message });
  }
};

exports.bulkCreateMaterialRequests = async (req, res) => {
  const { requests } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({ message: 'Valid requests array is required' });
  }

  try {
    const createdBy = typeof req.user?.id === 'number' ? req.user.id : null;
    
    // Check if the requests are in the new format or old format
    // Old format: array of single items
    // New format: array of objects with items[]
    
    let processedRequests = [];
    
    // If it looks like the old format (many items for the same plan), 
    // we might want to consolidate them into one request.
    // However, to keep it simple and consistent with what ProductionPlanFormPage does:
    // we will check if it's a list of single-material requests and consolidate if they share rootCardId and productionPlanId
    
    const firstReq = requests[0];
    if (!firstReq.items && firstReq.materialName) {
      // Consolidate old format requests into one multi-item request
      const consolidated = {
        rootCardId: firstReq.rootCardId,
        productionPlanId: firstReq.productionPlanId,
        department: firstReq.department || 'Production',
        purpose: firstReq.purpose || 'Material Issue',
        requiredDate: firstReq.requiredDate,
        priority: firstReq.priority || 'medium',
        remarks: firstReq.remarks,
        createdBy,
        items: requests.map(r => ({
          materialName: r.materialName,
          materialCode: r.materialCode,
          quantity: r.quantity,
          unit: r.unit,
          specification: r.specification
        }))
      };
      processedRequests = [consolidated];
    } else {
      processedRequests = requests.map(req => ({
        ...req,
        createdBy,
        status: 'draft'
      }));
    }

    const ids = await MaterialRequest.bulkCreate(processedRequests);

    res.status(201).json({
      message: `${ids.length} material requests created successfully`,
      ids
    });
  } catch (error) {
    console.error('Bulk create material request error:', error.message);
    res.status(500).json({ message: 'Failed to create material requests' });
  }
};

exports.getMaterialRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const materialRequest = await MaterialRequest.findById(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Material request not found' });
    }

    res.json({
      materialRequest
    });
  } catch (error) {
    console.error('Get material request error:', error.message);
    res.status(500).json({ message: 'Failed to fetch material request' });
  }
};

exports.getMaterialRequestsByRootCard = async (req, res) => {
  const { rootCardId } = req.params;

  try {
    const materialRequests = await MaterialRequest.findByRootCardId(rootCardId);

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
  const { status, priority, search, rootCardId } = req.query;

  try {
    const materialRequests = await MaterialRequest.findAll({
      status,
      priority,
      search,
      rootCardId
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
  const { status, priority, remarks, required_date, target_warehouse_id, purpose, department } = req.body;

  try {
    const materialRequest = await MaterialRequest.findById(id);

    if (!materialRequest) {
      return res.status(404).json({ message: 'Material request not found' });
    }

    await MaterialRequest.update(id, {
      status,
      priority,
      remarks,
      required_date,
      target_warehouse_id,
      purpose,
      department
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

  const validStatuses = ['draft', 'submitted', 'pending', 'approved', 'ordered', 'received', 'rejected', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    console.log(`Updating MR ${id} status to ${status}`);
    
    // Use the model method for consistency
    await MaterialRequest.updateStatus(id, status);

    res.json({ message: 'Material request status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    
    // Fallback if ID is actually MR number
    try {
      const [mrResult] = await pool.execute(
        'UPDATE material_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE mr_number = ?',
        [status, id]
      );
      
      if (mrResult.affectedRows > 0) {
        return res.json({ message: 'Material request status updated successfully (by MR number)' });
      }
    } catch (fallbackError) {
      console.error('Fallback update error:', fallbackError);
    }

    res.status(500).json({ message: 'Failed to update status', error: error.message });
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

// Vendor related methods might need updates too, but let's focus on the core flow first.
// The user didn't explicitly ask for vendor management yet.
exports.addVendorQuote = async (req, res) => { res.status(501).json({ message: 'Not implemented for new structure yet' }); };
exports.getVendorQuotes = async (req, res) => { res.status(501).json({ message: 'Not implemented for new structure yet' }); };
exports.selectVendor = async (req, res) => { res.status(501).json({ message: 'Not implemented for new structure yet' }); };
