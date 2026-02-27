const pool = require('../../config/database');
const RootCard = require('../../models/RootCard');
const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
const EmployeeTask = require('../../models/EmployeeTask');
const Project = require('../../models/Project');
const ProductionRootCard = require('../../models/ProductionRootCard');
const Material = require('../../models/Material');
const MaterialRequirementsDetail = require('../../models/MaterialRequirementsDetail');
const RootCardStep = require('../../models/RootCardStep');
const Notification = require('../../models/Notification');
const AlertsNotification = require('../../models/AlertsNotification');

exports.getAssignedRootCards = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    const [rootCards] = await pool.execute(
      'SELECT * FROM sales_orders WHERE assigned_to = ? OR created_by = ? ORDER BY created_at DESC',
      [userId, userId]
    );

    const stats = {
      total: rootCards.length,
      pending: rootCards.filter(o => o.status === 'pending').length,
      approved: rootCards.filter(o => o.status === 'approved').length,
      in_progress: rootCards.filter(o => o.status === 'in_progress').length,
      completed: rootCards.filter(o => o.status === 'completed').length,
      delivered: rootCards.filter(o => o.status === 'delivered').length
    };

    res.json({ rootCards, stats });
  } catch (error) {
    console.error('Get assigned root cards error:', error);
    res.status(500).json({ message: 'Failed to load assigned root cards' });
  }
};

exports.getRootCards = async (req, res) => {
  try {
    const { status, search, includeSteps, assignedOnly, hasMaterialRequests } = req.query;
    const userId = req.user?.id || req.user?.userId;

    const rootCards = await RootCard.findAll({ 
      status, 
      search,
      includeSteps: includeSteps !== 'false',
      assignedOnly,
      hasMaterialRequests,
      userId
    });
    const stats = await RootCard.getStats();
    res.json({ rootCards, stats });
  } catch (error) {
    console.error('Get root cards error:', error);
    res.status(500).json({ message: 'Failed to load root cards' });
  }
};

exports.getRootCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const rootCard = await RootCard.findById(id);

    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    res.json({ rootCard: rootCard });
  } catch (error) {
    console.error('Get root card error:', error);
    res.status(500).json({ message: 'Failed to load root card' });
  }
};

exports.createRootCard = async (req, res) => {
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
    return res.status(400).json({ message: 'Client, PO number, root card date, and total amount are required' });
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
      const RootCardStep = require('../../models/RootCardStep');
      
      const rootCardId = await RootCard.create({
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

      await RootCardStep.initializeAllSteps(rootCardId, connection);

      const projectCode = `PRJ-${poNumber}-${Date.now()}`;
      // Note: We used to create Project and ProductionRootCard here, but now
      // they are automatically created when the Sales Order is "Sent to Production"
      // from the Admin Sales Order page to ensure Production only sees what's authorized.

      await connection.commit();

      const createdRootCard = await RootCard.findById(rootCardId);

      res.status(201).json({
        message: 'Root card created successfully',
        rootCard: createdRootCard
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create root card error:', error.message);
    console.error('SQL Error:', error.sql);
    res.status(500).json({ message: error.message || 'Failed to create root card' });
  }
};

exports.updateRootCard = async (req, res) => {
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

    const rootCard = await RootCard.findById(id);
    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
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

    await RootCard.update(id, updateData);

    const updatedRootCard = await RootCard.findById(id);

    res.json({
      message: 'Root card updated successfully',
      rootCard: updatedRootCard
    });
  } catch (error) {
    console.error('Update root card error:', error);
    res.status(500).json({ message: 'Failed to update root card' });
  }
};

exports.updateRootCardStatus = async (req, res) => {
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

    const rootCard = await RootCard.findById(id);
    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    await RootCard.updateStatus(id, status);

    const updatedRootCard = await RootCard.findById(id);

    res.json({ 
      message: 'Status updated successfully',
      rootCard: updatedRootCard
    });
  } catch (error) {
    console.error('Update root card status error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ 
      message: 'Failed to update status',
      error: error.message || 'Unknown error'
    });
  }
};

exports.deleteRootCard = async (req, res) => {
  try {
    const { id } = req.params;

    const rootCard = await RootCard.findById(id);
    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    await pool.execute('DELETE FROM sales_orders WHERE id = ?', [id]);

    res.json({ message: 'Root card deleted successfully' });
  } catch (error) {
    console.error('Delete root card error:', error);
    res.status(500).json({ message: 'Failed to delete root card' });
  }
};

exports.assignRootCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignedAt } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: 'Assignee is required' });
    }

    const rootCard = await RootCard.findById(id);
    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    await pool.execute(
      'UPDATE sales_orders SET assigned_to = ?, assigned_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [assignedTo, assignedAt || new Date(), id]
    );

    res.json({ message: 'Root card assigned successfully' });
  } catch (error) {
    console.error('Assign root card error:', error);
    res.status(500).json({ message: 'Failed to assign root card' });
  }
};

exports.sendToInventory = async (req, res) => {
  try {
    const { rootCardId } = req.params;
    
    if (!rootCardId) {
      return res.status(400).json({ message: 'Root Card ID is required' });
    }

    // 1. Fetch Root Card with Design Details
    const [rows] = await pool.execute(
      'SELECT project_name, id FROM sales_orders WHERE id = ?',
      [rootCardId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Root Card not found' });
    }

    const projectName = rows[0].project_name;

    // Fetch from new Design Engineering model
    const designDetail = await DesignEngineeringDetail.findByRootCardId(rootCardId);
    const designDetails = designDetail ? designDetail.specifications : null;

    // 2. Ensure project exists for this root card
    let projectId = null;
    try {
      const [existingProjects] = await pool.execute(
        'SELECT id FROM projects WHERE sales_order_id = ? LIMIT 1',
        [rootCardId]
      );
      
      if (existingProjects.length > 0) {
        projectId = existingProjects[0].id;
      } else if (projectName) {
        // Create a project if it doesn't exist
        const result = await Project.create({
          name: projectName,
          rootCardId: rootCardId,
          status: 'draft'
        });
        projectId = result;
      }
    } catch (projectError) {
      console.error('Error creating/fetching project:', projectError);
      throw new Error(`Project creation failed: ${projectError.message}`);
    }

    // Note: Project and Production Root Card creation moved to "Sent to Production" trigger
    // in salesManagementController to ensure proper department separation and authorization.
    
    // We only create an inventory alert/task if needed here, but the core records 
    // should follow the authorized "Sent to Production" flow.

    if (!designDetails) {
      return res.status(400).json({ message: 'No design details found for this project' });
    }

    // 4. Extract Materials
    const categories = {
      steelSections: 'Steel Section',
      plates: 'Plate',
      fasteners: 'Fastener',
      components: 'Component',
      electrical: 'Electrical',
      consumables: 'Consumable'
    };

    const requirements = [];
    const addedToMaster = [];

    // Parse design details if string
    const details = typeof designDetails === 'string' ? JSON.parse(designDetails) : designDetails;

    for (const [field, category] of Object.entries(categories)) {
      const items = details[field];
      if (Array.isArray(items)) {
        for (const rawItemName of items) {
          if (!rawItemName || typeof rawItemName !== 'string' || rawItemName.trim() === '') continue;
          const itemName = rawItemName.trim();

          // Check Master Material (don't create automatically)
          let material = await Material.findByName(itemName);
          
          // Add to Requirements List
          requirements.push({
            id: Date.now() + Math.random(),
            itemCode: material ? (material.itemCode || material.item_code) : 'PENDING',
            itemName: itemName,
            category: material ? material.category : category,
            requiredQuantity: 0, // Default to 0 as we don't have qty from Design
            currentStock: material ? (material.quantity || 0) : 0,
            status: 'pending',
            notes: material ? 'Auto-sync from Design' : 'Auto-sync from Design (New material - needs registration)',
            materialId: material ? material.id : null,
            inInventory: !!material
          });
        }
      }
    }

    // 5. Create/Update Material Requirements Detail
    // Force clean rebuild of requirements to fix "Unnamed Material" issues
    const existingReq = await MaterialRequirementsDetail.findByRootCardId(rootCardId);
    
    // Instead of complex merging that might preserve bad data, we will:
    // 1. Keep track of manually entered quantities from existing records
    // 2. Rebuild the list based on current Design Details
    // 3. Re-apply the quantities where names match

    const savedDataMap = new Map();
    if (existingReq && existingReq.materials) {
      existingReq.materials.forEach(m => {
        if (m.itemName) {
          savedDataMap.set(m.itemName, {
            requiredQuantity: m.requiredQuantity || m.quantity,
            notes: m.notes,
            materialId: m.materialId,
            itemCode: m.itemCode
          });
        }
      });
    }

    // Apply saved data to the freshly generated requirements
    const finalRequirements = requirements.map(req => {
      const saved = savedDataMap.get(req.itemName);
      if (saved) {
        return {
          ...req,
          requiredQuantity: saved.requiredQuantity || 0,
          quantity: saved.requiredQuantity || 0, // Keep both for compatibility
          notes: saved.notes || req.notes,
          materialId: saved.materialId || req.materialId,
          itemCode: (saved.itemCode && saved.itemCode !== 'PENDING') ? saved.itemCode : req.itemCode
        };
      }
      return req;
    });

    if (existingReq) {
      await MaterialRequirementsDetail.update(rootCardId, {
        materials: finalRequirements,
        procurementStatus: existingReq.procurementStatus
      });
    } else {
      await MaterialRequirementsDetail.create({
        rootCardId,
        materials: finalRequirements,
        procurementStatus: 'pending',
        notes: `Generated from Design Project: ${projectName}`
      });
    }

    // Start Material Requirements step (Step 3)
    try {
      await RootCardStep.startStep(rootCardId, 3);
    } catch (stepError) {
      console.warn('Failed to start Material Requirements step:', stepError.message);
    }

    res.json({ 
      message: 'Sent to inventory successfully',
      addedToMasterCount: addedToMaster.length,
      requirementsCount: requirements.length
    });

  } catch (error) {
    console.error('Send to Inventory error:', error);
    res.status(500).json({ 
      message: 'Failed to send to inventory',
      error: error.message 
    });
  }
};

exports.getRootCardsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const decodedDept = decodeURIComponent(department || 'Design Engineering');

    const [rootCards] = await pool.execute(`
      SELECT DISTINCT so.id, so.po_number, so.project_name, so.customer, so.order_date, so.due_date, so.status, so.priority, so.created_at
      FROM sales_orders so
      INNER JOIN root_cards_departments rcd ON so.id = rcd.root_card_id
      WHERE rcd.department = ?
      ORDER BY so.created_at DESC
      LIMIT 100
    `, [decodedDept]);

    console.log(`[getRootCardsByDepartment] Found ${rootCards.length} root cards for ${decodedDept}`);

    res.json({
      status: 'success',
      data: rootCards,
      message: `Root cards for ${decodedDept} department retrieved`
    });
  } catch (error) {
    console.error('Error fetching root cards by department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch root cards',
      error: error.message
    });
  }
};

exports.sendToDesignEngineering = async (req, res) => {
  try {
    const { rootCardId } = req.params;
    const userId = req.user?.id;

    if (!rootCardId) {
      return res.status(400).json({ message: 'Root Card ID is required' });
    }

    const [rootCardRows] = await pool.execute(
      'SELECT id, po_number, project_name, customer FROM sales_orders WHERE id = ?',
      [rootCardId]
    );

    if (rootCardRows.length === 0) {
      return res.status(404).json({ message: 'Root Card not found' });
    }

    const rootCard = rootCardRows[0];

    const [designEngineers] = await pool.execute(`
      SELECT DISTINCT u.id, u.username, u.email
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE r.name IN (
        'Design Engineer', 'design_engineer', 'design.engineer',
        'Engineering', 'engineering', 
        'Design Engineering', 'design_engineering', 'design.engineering'
      )
    `);

    if (designEngineers.length === 0) {
      return res.status(400).json({ message: 'No Design Engineers found in the system' });
    }

    try {
      await pool.execute(
        'INSERT INTO root_cards_departments (root_card_id, department, assigned_by, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
        [rootCardId, 'Design Engineering', userId || null, 'pending', 'pending']
      );
      console.log(`Root Card ${rootCardId} added to Design Engineering department`);

      // Automatically generate workflow tasks
      try {
        const productionController = require('../production/productionController');
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();
          // Pass userId (sender) as the initial user, it will fallback to a Design Engineer if sender is Admin
          await productionController.internalCreateWorkflowTasks(rootCardId, userId, connection);
          await connection.commit();
          console.log(`[sendToDesignEngineering] ✓ Automatically generated workflow tasks for Root Card ${rootCardId}`);
        } catch (workflowError) {
          await connection.rollback();
          console.error(`[sendToDesignEngineering] Workflow task generation failed:`, workflowError.message);
        } finally {
          connection.release();
        }
      } catch (err) {
        console.error(`[sendToDesignEngineering] Error setting up workflow tasks:`, err.message);
      }
    } catch (dbError) {
      console.error('Error adding root card to department:', dbError);
    }

    let notificationCount = 0;
    for (const engineer of designEngineers) {
      try {
        await AlertsNotification.create({
          userId: engineer.id,
          fromUserId: userId,
          alertType: 'root_card_assignment',
          message: `Root Card ${rootCard.po_number} (${rootCard.project_name}) has been sent to Design Engineering Department`,
          relatedTable: 'sales_orders',
          relatedId: rootCardId,
          priority: 'high',
          link: `/design-engineer/root-cards`
        });
        notificationCount++;
      } catch (notificationError) {
        console.error(`Failed to send notification to engineer ${engineer.id}:`, notificationError);
      }
    }

    res.json({
      message: 'Root Card sent to Design Engineering Department successfully',
      rootCard: {
        id: rootCard.id,
        poNumber: rootCard.po_number,
        projectName: rootCard.project_name,
        customer: rootCard.customer
      },
      notificationsSent: notificationCount,
      designEngineersNotified: designEngineers.length
    });

  } catch (error) {
    console.error('Send to Design Engineering error:', error);
    res.status(500).json({
      message: 'Failed to send to Design Engineering',
      error: error.message
    });
  }
};
