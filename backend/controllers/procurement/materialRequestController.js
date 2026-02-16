const MaterialRequest = require('../../models/MaterialRequest');
const Vendor = require('../../models/Vendor');
const Material = require('../../models/Material');
const StockEntry = require('../../models/StockEntry');
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
      status: 'approved',
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
        status: 'approved'
      }));
    }

    const ids = await MaterialRequest.bulkCreate(processedRequests);

    res.status(201).json({
      message: `${ids.length} material requests created successfully`,
      ids
    });
  } catch (error) {
    console.error('Bulk create material request error:', error.message);
    res.status(500).json({ message: 'Failed to create material requests', error: error.message });
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

    if (!['draft', 'submitted', 'approved', 'pending'].includes(materialRequest.status)) {
      return res.status(400).json({
        message: `Only requests in draft, submitted, or approved status can be deleted. Current status: ${materialRequest.status}`
      });
    }

    // Check if there are linked Purchase Orders or Quotations before deleting
    if (materialRequest.po_count > 0 || materialRequest.rfq_count > 0) {
      return res.status(400).json({
        message: 'Cannot delete material request with linked Purchase Orders or Quotations'
      });
    }

    await MaterialRequest.delete(id);

    res.json({ message: 'Material request deleted successfully' });
  } catch (error) {
    console.error('Delete material request error:', error.message);
    res.status(500).json({ message: 'Failed to delete material request' });
  }
};

exports.releaseMaterial = async (req, res) => {
  const { id } = req.params;
  const { warehouseName } = req.body; // Optional specific warehouse to deduct from
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const materialRequest = await MaterialRequest.findById(id);
    if (!materialRequest) {
      await connection.rollback();
      return res.status(404).json({ message: 'Material request not found' });
    }

    if (materialRequest.status === 'received') {
      await connection.rollback();
      return res.status(400).json({ message: 'Materials already released for this request' });
    }

    const items = materialRequest.items || [];
    if (items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'No items found in this material request' });
    }

    const stockEntryItems = [];

    for (const item of items) {
      // Find material by code first, then name
      let material = null;
      const materialCode = item.material_code || item.materialCode;
      const materialName = item.material_name || item.materialName;

      if (materialCode) {
        material = await Material.findByItemCode(materialCode);
      }
      
      if (!material) {
        material = await Material.findByName(materialName);
      }

      if (!material) {
        throw new Error(`Material not found in inventory: ${materialName || 'Unknown'}`);
      }

      // Determine warehouse
      let targetWarehouse = warehouseName;
      
      if (!targetWarehouse) {
        // If no specific warehouse provided, find one with stock
        const stockLevels = await Material.getStockByWarehouse(material.id);
        const warehouseWithStock = stockLevels.find(s => s.quantity >= (item.quantity || item.qty));
        
        if (warehouseWithStock) {
          targetWarehouse = warehouseWithStock.warehouse_name;
        } else if (stockLevels.length > 0) {
          // Use first warehouse even if insufficient (will result in negative stock if allowed)
          targetWarehouse = stockLevels[0].warehouse_name;
        } else {
          targetWarehouse = 'Main Warehouse'; // Fallback
        }
      }

      // Deduct stock (negative quantity)
      const qty = item.quantity || item.qty || 0;
      const deductQty = -Math.abs(qty);
      const warehouseToDeduct = targetWarehouse.trim();
      
      // Update stock using connection for transaction
      await connection.execute(`
        INSERT INTO material_stock (material_id, warehouse_name, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `, [material.id, warehouseToDeduct, deductQty]);

      // Update main inventory table
      await connection.execute(`
        UPDATE inventory i
        SET i.quantity = (SELECT COALESCE(SUM(quantity), 0) FROM material_stock WHERE material_id = ?),
            i.warehouse = ?
        WHERE i.id = ?
      `, [material.id, warehouseToDeduct, material.id]);

      stockEntryItems.push({
        material_id: material.id,
        item_code: material.itemCode,
        item_name: material.itemName,
        quantity: qty,
        unit: item.unit,
        warehouse: targetWarehouse
      });
    }

    // Create Stock Entry (Material Issue)
    const entryDate = new Date();
    const entryNo = `SE-MI-${entryDate.getFullYear()}${String(entryDate.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    await connection.execute(
      `INSERT INTO stock_entries (
        entry_no, entry_date, entry_type, 
        from_warehouse, remarks, items, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entryNo,
        entryDate,
        'Material Issue',
        warehouseName || 'Multiple Warehouses',
        `Released for MR: ${materialRequest.mr_number}`,
        JSON.stringify(stockEntryItems),
        'submitted'
      ]
    );

    // Update MR status to 'received' (as requested by user)
    await connection.execute(
      'UPDATE material_requests SET status = "received", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    await connection.commit();
    res.json({ message: 'Materials released and stock deducted successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Release material error:', error);
    res.status(500).json({ message: 'Failed to release materials', error: error.message });
  } finally {
    connection.release();
  }
};

// Vendor related methods might need updates too, but let's focus on the core flow first.
// The user didn't explicitly ask for vendor management yet.
exports.addVendorQuote = async (req, res) => { res.status(501).json({ message: 'Not implemented for new structure yet' }); };
exports.getVendorQuotes = async (req, res) => { res.status(501).json({ message: 'Not implemented for new structure yet' }); };
exports.selectVendor = async (req, res) => { res.status(501).json({ message: 'Not implemented for new structure yet' }); };
