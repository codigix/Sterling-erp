const MaterialRequest = require('../../models/MaterialRequest');
const Vendor = require('../../models/Vendor');
const Material = require('../../models/Material');
const StockEntry = require('../../models/StockEntry');
const AlertsNotification = require('../../models/AlertsNotification');
const productionController = require('../production/productionController');
const RootCardInventoryTask = require('../../models/RootCardInventoryTask');
const WorkflowTaskHelper = require('../../utils/workflowTaskHelper');
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

    // Format date for MySQL
    let formattedRequiredDate = null;
    if (requiredDate) {
      try {
        formattedRequiredDate = new Date(requiredDate).toISOString().slice(0, 10);
      } catch (e) {
        console.error('Invalid requiredDate:', requiredDate);
      }
    }

    const materialRequestId = await MaterialRequest.create({
      rootCardId,
      productionPlanId,
      items: requestItems,
      department,
      purpose,
      targetWarehouseId,
      requiredDate: formattedRequiredDate,
      priority,
      status: 'submitted',
      createdBy: createdBy || (req.user ? req.user.id : null),
      remarks
    });

    const createdRequest = await MaterialRequest.findById(materialRequestId);

    // Notify Inventory Managers
    try {
      await notifyInventoryManagers(createdRequest);
      
      const effectiveCreatedBy = createdBy || (req.user ? req.user.id : null);

      // Automatically create inventory workflow tasks for this material request
      if (materialRequestId) {
        const conn = await pool.getConnection();
        try {
          // 1. Create standard department tasks if root card exists (optional/legacy)
          if (rootCardId && effectiveCreatedBy) {
            try {
              await productionController.internalCreateWorkflowTasks(
                rootCardId, 
                effectiveCreatedBy, 
                conn, 
                'inventory'
              );
            } catch (wfErr) {
              console.warn(`[MR-Single] Standard workflow task creation skipped/failed: ${wfErr.message}`);
            }
          }

          // 2. Initialize RootCardInventoryTask for InventoryTasksPage
          let actualRootCardId = rootCardId;

          if (rootCardId) {
            let [rcRows] = await conn.execute(
              'SELECT id, project_id, project_name, po_number FROM root_cards WHERE id = ? OR sales_order_id = ? LIMIT 1',
              [rootCardId, rootCardId]
            );

            if (rcRows.length > 0) {
              actualRootCardId = rcRows[0].id;
              let projectId = rcRows[0].project_id;
              
              if (!projectId) {
                const projectName = rcRows[0].project_name || `Project-${rcRows[0].po_number || actualRootCardId}`;
                const [projectResult] = await conn.execute(
                  'INSERT INTO projects (name, sales_order_id, status) VALUES (?, ?, ?)',
                  [projectName, actualRootCardId, 'draft']
                );
                projectId = projectResult.insertId;
                await conn.execute('UPDATE root_cards SET project_id = ? WHERE id = ?', [projectId, actualRootCardId]);
              }
            }
          }
          
          console.log(`[MR-Single] Initializing RootCardInventoryTask for MR: ${materialRequestId}, RootCard: ${actualRootCardId}`);
          await RootCardInventoryTask.initializeRootCardTasks(actualRootCardId || null, null, conn, materialRequestId);

          // Task completion is now handled in updateMaterialRequestStatus only when MR status is 'completed'
          /*
          if (rootCardId) {
            try {
              await WorkflowTaskHelper.completeAndOpenNext(rootCardId, 'Initiate Material Request');
            } catch (workflowErr) {
              console.warn(`[MR-Single] Workflow task completion skipped/failed: ${workflowErr.message}`);
            }
          }
          */
        } finally {
          conn.release();
        }
      }
    } catch (notifError) {
      console.error('Failed to notify inventory managers or create workflow:', notifError.message);
      // Don't fail the request if notification or workflow creation fails
    }

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
      // Format date for MySQL
      let formattedRequiredDate = null;
      if (firstReq.requiredDate) {
        try {
          formattedRequiredDate = new Date(firstReq.requiredDate).toISOString().slice(0, 10);
        } catch (e) {
          console.error('Invalid requiredDate in bulk:', firstReq.requiredDate);
        }
      }

      // Consolidate old format requests into one multi-item request
      const consolidated = {
        rootCardId: firstReq.rootCardId,
        productionPlanId: firstReq.productionPlanId,
        department: firstReq.department || 'Production',
        purpose: firstReq.purpose || 'Material Issue',
        requiredDate: formattedRequiredDate,
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
      processedRequests = requests.map(req => {
        let formattedDate = null;
        if (req.requiredDate) {
          try {
            formattedDate = new Date(req.requiredDate).toISOString().slice(0, 10);
          } catch (e) {
            console.error('Invalid requiredDate in bulk item:', req.requiredDate);
          }
        }
        
        return {
          ...req,
          requiredDate: formattedDate,
          createdBy,
          status: 'submitted'
        };
      });
    }

    const ids = await MaterialRequest.bulkCreate(processedRequests);

    // Notify Inventory Managers and initialize workflows for all created requests
    try {
      if (ids && ids.length > 0) {
        const firstRequest = await MaterialRequest.findById(ids[0]);
        if (firstRequest) {
          await notifyInventoryManagers(firstRequest, ids.length);
        }

        const conn = await pool.getConnection();
        try {
          const effectiveCreatedBy = createdBy || (req.user ? req.user.id : null);
          
          for (const mrId of ids) {
            const mr = await MaterialRequest.findById(mrId);
            if (!mr) continue;

            const targetRootCardId = mr.sales_order_id || mr.root_card_id;
            
            console.log(`[MR-Bulk] Processing workflow for MR: ${mr.id} (MR Number: ${mr.mr_number}), Root Card: ${targetRootCardId}`);
            
            // 1. Create standard department tasks if root card exists (optional/legacy)
            if (targetRootCardId && effectiveCreatedBy) {
              try {
                await productionController.internalCreateWorkflowTasks(
                  targetRootCardId, 
                  effectiveCreatedBy, 
                  conn, 
                  'inventory'
                );
              } catch (wfErr) {
                console.warn(`[MR-Bulk] Standard workflow task creation skipped/failed: ${wfErr.message}`);
              }
            }

            // 2. Initialize RootCardInventoryTask for InventoryTasksPage
            let actualRootCardId = targetRootCardId;
            if (targetRootCardId) {
              let [rcRows] = await conn.execute(
                'SELECT id FROM root_cards WHERE id = ? OR sales_order_id = ? LIMIT 1',
                [targetRootCardId, targetRootCardId]
              );
              if (rcRows.length > 0) {
                actualRootCardId = rcRows[0].id;
              }
            }
            
            console.log(`[MR-Bulk] Initializing RootCardInventoryTask for MR: ${mr.id}, RootCard: ${actualRootCardId}`);
            await RootCardInventoryTask.initializeRootCardTasks(actualRootCardId || null, null, conn, mr.id);

            // Task completion is now handled in updateMaterialRequestStatus only when MR status is 'completed'
            /*
            if (targetRootCardId) {
              try {
                await WorkflowTaskHelper.completeAndOpenNext(targetRootCardId, 'Initiate Material Request');
              } catch (workflowErr) {
                console.warn(`[MR-Bulk] Workflow task completion skipped/failed: ${workflowErr.message}`);
              }
            }
            */
          }
        } finally {
          conn.release();
        }
      }
    } catch (notifError) {
      console.error('Failed to notify inventory managers or create workflow for bulk request:', notifError.message);
    }

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

exports.getMaterialRequestsByProductionPlan = async (req, res) => {
  const { productionPlanId } = req.params;

  try {
    const materialRequests = await MaterialRequest.findByProductionPlanId(productionPlanId);

    res.json({
      materialRequests,
      total: materialRequests.length
    });
  } catch (error) {
    console.error('Get material requests by production plan error:', error.message);
    res.status(500).json({ message: 'Failed to fetch material requests' });
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

  const validStatuses = ['draft', 'submitted', 'pending', 'approved', 'ordered', 'received', 'rejected', 'cancelled', 'completed'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    console.log(`Updating MR ${id} status to ${status}`);
    
    // Use the model method for consistency
    await MaterialRequest.updateStatus(id, status);

    // If status is completed or received, trigger workflow completion for production workflow
    if (status === 'completed' || status === 'received') {
      const materialRequest = await MaterialRequest.findById(id);
      if (materialRequest) {
        const conn = await pool.getConnection();
        try {
          let targetRootCardId = materialRequest.sales_order_id || materialRequest.root_card_id;
          
          // If not found, try to resolve from production plan
          if (!targetRootCardId && materialRequest.production_plan_id) {
            const [planRows] = await conn.execute(
              'SELECT root_card_id, sales_order_id FROM production_plans WHERE id = ?',
              [materialRequest.production_plan_id]
            );
            if (planRows.length > 0) {
              targetRootCardId = planRows[0].root_card_id || planRows[0].sales_order_id;
            }
          }

          if (targetRootCardId) {
            // Also complete the Production workflow task "Initiate Material Request"
            await WorkflowTaskHelper.completeAndOpenNext(targetRootCardId, 'Initiate Material Request', conn);
            console.log(`[MR-Status-Trigger] Syncing production workflow for MR: ${id}, targetRootCardId: ${targetRootCardId}`);
          }
        } finally {
          conn.release();
        }
      }
    }

    // If status is approved, trigger inventory workflow initialization
    if (status === 'approved') {
      const materialRequest = await MaterialRequest.findById(id);
      if (materialRequest) {
        const conn = await pool.getConnection();
        try {
          const targetRootCardId = materialRequest.sales_order_id || materialRequest.root_card_id;
          
          // Check if tasks already exist for this MR (Inventory Workflow)
          const [existingTasks] = await conn.execute(
            'SELECT id FROM root_card_inventory_tasks WHERE material_request_id = ? LIMIT 1',
            [id]
          );

          if (existingTasks.length === 0) {
            console.log(`[MR-Status-Trigger] Initializing inventory workflow for approved MR: ${id}`);
            
            let actualRootCardId = targetRootCardId;

            if (targetRootCardId) {
              // Get root card details to ensure project exists
              const [rcRows] = await conn.execute(
                `SELECT rc.id, rc.project_id, p.name as project_name, so.po_number 
                 FROM root_cards rc
                 LEFT JOIN projects p ON rc.project_id = p.id
                 LEFT JOIN sales_orders so ON rc.sales_order_id = so.id
                 WHERE rc.id = ? OR rc.sales_order_id = ? 
                 LIMIT 1`,
                [targetRootCardId, targetRootCardId]
              );

              if (rcRows.length > 0) {
                actualRootCardId = rcRows[0].id;
                let projectId = rcRows[0].project_id;
                
                if (!projectId) {
                  const projectName = rcRows[0].project_name || `Project-${rcRows[0].po_number || actualRootCardId}`;
                  const [projectResult] = await conn.execute(
                    'INSERT INTO projects (name, sales_order_id, status) VALUES (?, ?, ?)',
                    [projectName, actualRootCardId, 'draft']
                  );
                  projectId = projectResult.insertId;
                  await conn.execute('UPDATE root_cards SET project_id = ? WHERE id = ?', [projectId, actualRootCardId]);
                }
              }
            }
            
            await RootCardInventoryTask.initializeRootCardTasks(actualRootCardId || null, null, conn, id);
          }
          
          // Complete Inventory Step 1: Check Project Material Requirements
          console.log(`[MR-Status-Trigger] Completing inventory Step 1 for MR: ${id}`);
          await RootCardInventoryTask.completeTaskByMRAndStep(id, 1, req.user?.id, conn);
        } finally {
          conn.release();
        }
      }
    }

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

    if (materialRequest.status === 'received' || materialRequest.status === 'completed') {
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
        material_type: material.category, // Added material type (category)
        quantity: qty,
        unit: item.unit,
        warehouse: warehouseToDeduct
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

    // Update MR status to 'completed' (as requested by user)
    await connection.execute(
      'UPDATE material_requests SET status = "completed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    // Sync overall workflow including Step 14: Release Material
    try {
      await RootCardInventoryTask.syncMRWorkflow(id);
      console.log(`[MR-Release] Synced workflow for MR ${id} after release`);
    } catch (syncErr) {
      console.warn('[MR-Release] Workflow sync error:', syncErr.message);
    }

    // Update all items in the request to 'completed'
    await connection.execute(
      'UPDATE material_request_items SET status = "completed", updated_at = CURRENT_TIMESTAMP WHERE material_request_id = ?',
      [id]
    );

    // Refetch MR after status updates to get latest data for notification
    const updatedMR = await MaterialRequest.findById(id, connection);

    // Notify Production Department
    try {
      if (updatedMR) {
        await notifyProductionRelease(updatedMR, connection);
      } else {
        await notifyProductionRelease(materialRequest, connection);
      }
    } catch (notifError) {
      console.warn('Could not notify production:', notifError.message);
    }

    // Complete the workflow tasks if they exist
    let targetRootCardId = materialRequest.sales_order_id || materialRequest.root_card_id;
    
    // If not directly on MR, try to resolve from production plan
    if (!targetRootCardId && materialRequest.production_plan_id) {
      const [planRows] = await connection.execute(
        'SELECT root_card_id, sales_order_id FROM production_plans WHERE id = ?',
        [materialRequest.production_plan_id]
      );
      if (planRows.length > 0) {
        targetRootCardId = planRows[0].root_card_id || planRows[0].sales_order_id;
      }
    }

    if (targetRootCardId) {
      try {
        // Complete the Production workflow task "Initiate Material Request" if not already completed
        await WorkflowTaskHelper.completeAndOpenNext(targetRootCardId, 'Initiate Material Request', connection);
        
        // Complete the Inventory workflow task "Add to Stock & Release Material"
        await WorkflowTaskHelper.completeAndOpenNext(targetRootCardId, 'Add to Stock & Release Material', connection);
      } catch (wfError) {
        console.warn('Could not complete workflow task:', wfError.message);
      }
    }

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

/**
 * Helper to notify inventory managers and inventory team
 */
async function notifyInventoryManagers(materialRequest, bulkCount = 0) {
  try {
    // Find ONLY inventory managers to notify (NOT all admins or workers)
    const [managers] = await pool.execute(`
      SELECT u.id, u.username, r.name as role_name
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE LOWER(r.name) IN ('inventory_manager', 'inventory manager', 'inventory', 'procurement')
      OR LOWER(u.username) IN ('inventory.manager', 'inventory_user', 'procurement.manger')
    `);

    console.log(`[notifyInventoryManagers] Found ${managers?.length || 0} potential recipients for MR ${materialRequest.mr_number}`);

    if (!managers || managers.length === 0) {
      console.log('No inventory managers found to notify');
      return;
    }

    const mrNumber = materialRequest.mr_number || materialRequest.id;
    const department = materialRequest.department || 'Production';
    
    // Customize message for bulk vs single
    const message = bulkCount > 1 
      ? `New bulk material request (${bulkCount} items) from ${department} department`
      : `New Material Request ${mrNumber} from ${department} department`;

    // 1. Notify Inventory Managers/Procurement/Admin
    for (const manager of managers) {
      console.log(`[notifyInventoryManagers] Sending notification to ${manager.username} (ID: ${manager.id})`);
      await AlertsNotification.create({
        userId: manager.id,
        fromUserId: materialRequest.created_by || null,
        message: message,
        alertType: 'info',
        relatedTable: 'material_requests',
        relatedId: materialRequest.id,
        priority: 'high', // Changed to high to ensure visibility
        link: '/inventory-manager/material-requests'
      });
    }

    // 2. Also notify the requester themselves (to confirm submission)
    const requesterId = materialRequest.created_by || materialRequest.requested_by;
    if (requesterId) {
      const isAlreadyNotified = managers.some(m => m.id === requesterId);
      if (!isAlreadyNotified) {
        await AlertsNotification.create({
          userId: requesterId,
          fromUserId: requesterId,
          message: `Your Material Request ${mrNumber} has been submitted successfully`,
          alertType: 'success',
          relatedTable: 'material_requests',
          relatedId: materialRequest.id,
          priority: 'medium',
          link: '/department/production/plans'
        });
      }
    }
  } catch (error) {
    console.error('Error in notifyInventoryManagers:', error);
    throw error;
  }
}

/**
 * Helper to notify production department about released materials
 */
async function notifyProductionRelease(materialRequest, connection = null) {
  try {
    const conn = connection || pool;
    const recipients = new Set();
    
    console.log('[notifyProductionRelease] Notifying for MR:', materialRequest.mr_number);
    console.log('[notifyProductionRelease] MR requested_by:', materialRequest.requested_by, 'created_by:', materialRequest.created_by);
    
    // 1. Get requested_by and created_by
    if (materialRequest.requested_by) recipients.add(materialRequest.requested_by);
    if (materialRequest.created_by) recipients.add(materialRequest.created_by);
    
    // 2. We no longer notify ALL production users to avoid portal spam.
    // Requester and creator (in step 1) are sufficient.
    /*
    const [productionManagers] = await conn.execute(`
      SELECT u.id 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name IN ('Production', 'production_manager', 'production manager')
    `);
    
    console.log('[notifyProductionRelease] Production role users found in DB:', productionManagers.length);
    productionManagers.forEach(u => recipients.add(u.id));
    */
    
    const mrNumber = materialRequest.mr_number || materialRequest.id;
    const message = `Materials released for Request ${mrNumber}. Ready for production!`;
    
    console.log('[notifyProductionRelease] Total unique recipients:', recipients.size, Array.from(recipients));
    
    for (const userId of recipients) {
      console.log('[notifyProductionRelease] Creating alert for userId:', userId);
      const alertId = await AlertsNotification.create({
        userId: userId,
        message: message,
        alertType: 'success',
        relatedTable: 'material_requests',
        relatedId: materialRequest.id,
        priority: 'high',
        link: '/department/production/plans'
      }, conn);
      console.log('[notifyProductionRelease] Alert created with ID:', alertId);
    }
  } catch (error) {
    console.error('Error in notifyProductionRelease:', error);
  }
}
