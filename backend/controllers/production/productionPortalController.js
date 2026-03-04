exports.getRootCards = async (req, res) => {
  try {
    const RootCard = require('../../models/RootCard');
    const RootCardStep = require('../../models/RootCardStep');
    const pool = require('../../config/database');
    const userId = parseInt(req.user.id);
    const { status, search, all, assignedOnly } = req.query;

    let filters = { userId };
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (search) {
      filters.search = search;
    }
    if (assignedOnly === 'true' || assignedOnly === true) {
      filters.assignedOnly = true;
    }

    const allRootCards = await RootCard.findAll(filters);

    // Filter to only show root cards that have been "Sent to Production" in sales_orders_management
    const [sentOrders] = await pool.execute(
      "SELECT id, root_card_id FROM sales_orders_management WHERE status = 'Sent to Production'"
    );
    
    // Create a map for quick lookup
    const sentOrderMap = {};
    sentOrders.forEach(o => {
      sentOrderMap[o.root_card_id] = o.id;
    });

    const authorizedRootCards = allRootCards.filter(card => 
      sentOrderMap[card.id] !== undefined
    ).map(card => ({
      ...card,
      sales_management_id: sentOrderMap[card.id]
    }));

    if (all === 'true' || req.user.role === 'Admin' || req.user.role === 'Production') {
      const rootCardsWithStats = authorizedRootCards.map(card => ({
        ...card,
        assignedSteps: []
      }));

      const stats = {
        totalRootCards: rootCardsWithStats.length,
        inProgressRootCards: rootCardsWithStats.filter(rc => rc.status === 'in_progress').length,
        pendingRootCards: rootCardsWithStats.filter(rc => rc.status === 'pending').length,
        completedRootCards: rootCardsWithStats.filter(rc => rc.status === 'completed').length,
        planningRootCards: rootCardsWithStats.filter(rc => rc.status === 'planning').length
      };

      return res.json({ rootCards: rootCardsWithStats, stats });
    }

    const [assignedSteps] = await pool.execute(
      'SELECT DISTINCT sales_order_id FROM sales_order_steps WHERE assigned_to = ? AND step_id >= 2 AND step_id <= 7',
      [userId]
    );

    if (assignedSteps.length === 0) {
      return res.json({ rootCards: [], stats: {
        totalRootCards: 0,
        inProgressRootCards: 0,
        pendingRootCards: 0,
        completedRootCards: 0,
        planningRootCards: 0
      }});
    }

    const assignedSalesOrderIds = assignedSteps.map(s => s.sales_order_id);
    
    const filteredCards = authorizedRootCards.filter(card => 
      card.rootCardId && assignedSalesOrderIds.includes(card.rootCardId)
    );

    const rootCardsWithSteps = await Promise.all(
      filteredCards.map(async (card) => {
        const allSteps = await RootCardStep.findByRootCardId(card.rootCardId);
        const assignedStepsForCard = allSteps
          .filter(step => step.assignedTo && parseInt(step.assignedTo) === userId)
          .map(step => ({
            stepId: step.step_id,
            stepName: step.step_name,
            stepKey: step.step_key,
            status: step.status
          }));
        return {
          ...card,
          assignedSteps: assignedStepsForCard
        };
      })
    );

    const stats = {
      totalRootCards: rootCardsWithSteps.length,
      inProgressRootCards: rootCardsWithSteps.filter(rc => rc.status === 'in_progress').length,
      pendingRootCards: rootCardsWithSteps.filter(rc => rc.status === 'pending').length,
      completedRootCards: rootCardsWithSteps.filter(rc => rc.status === 'completed').length,
      planningRootCards: rootCardsWithSteps.filter(rc => rc.status === 'planning').length
    };

    res.json({ rootCards: rootCardsWithSteps, stats });
  } catch (error) {
    console.error('Get root cards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRootCardById = async (req, res) => {
  try {
    const RootCard = require('../../models/RootCard');
    const RootCardStep = require('../../models/RootCardStep');
    const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
    const MaterialRequirementsDetail = require('../../models/MaterialRequirementsDetail');
    const ProductionPlanDetail = require('../../models/ProductionPlanDetail');
    const QualityCheckDetail = require('../../models/QualityCheckDetail');
    const ShipmentDetail = require('../../models/ShipmentDetail');
    const DeliveryDetail = require('../../models/DeliveryDetail');
    
    const { id } = req.params;
    const { all } = req.query;
    const userId = parseInt(req.user.id);

    const rootCard = await RootCard.findById(id);
    
    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    let userAssignedSteps = [];
    let allSteps = [];
    const isAdmin = req.user.role === 'Admin' || req.user.role === 'Production';
    const bypassAuth = all === 'true' || isAdmin;
    
    if (rootCard.rootCardId) {
      allSteps = await RootCardStep.findByRootCardId(rootCard.rootCardId);
      userAssignedSteps = allSteps.filter(step => {
        if (!step.assignedTo) return false;
        const assignedUserId = parseInt(step.assignedTo);
        return !isNaN(assignedUserId) && assignedUserId === userId;
      });
    }
    
    const ManufacturingStage = require('../../models/ManufacturingStage');
    const manufacturingStages = await ManufacturingStage.findByRootCardIds([parseInt(id)]);
    const userAssignedStages = manufacturingStages.filter(stage => {
      if (!stage.assigned_worker) return false;
      const workerUserId = parseInt(stage.assigned_worker);
      return !isNaN(workerUserId) && workerUserId === userId;
    });
    
    if (!bypassAuth && userAssignedSteps.length === 0 && userAssignedStages.length === 0) {
      console.log(`[RC ${id}] Access Denied. User ${userId}: Steps=${userAssignedSteps.length}, Stages=${userAssignedStages.length}`);
      return res.status(403).json({ message: 'Access denied: Not assigned to any step or stage in this project' });
    }

    const stepData = {};
    
    // Step 1: Client PO
    const ClientPODetail = require('../../models/ClientPODetail');
    const step1 = await ClientPODetail.findByRootCardId(rootCard.rootCardId);
    if (step1) stepData.step1_clientPO = step1;

    // Step 2: Design Engineering
    const step2 = await DesignEngineeringDetail.findByRootCardId(rootCard.rootCardId);
    if (step2) stepData.step2_designEngineering = step2;

    // Step 3: Material Requirements
    const step3 = await MaterialRequirementsDetail.findByRootCardId(rootCard.rootCardId);
    if (step3) stepData.step3_materialRequirements = step3;

    // Step 4: Production Plan
    const step4 = await ProductionPlanDetail.findByRootCardId(rootCard.rootCardId);
    if (step4) stepData.step4_productionPlan = step4;

    // Step 5: Quality Check
    const step5 = await QualityCheckDetail.findByRootCardId(rootCard.rootCardId);
    if (step5) stepData.step5_qualityCheck = step5;

    // Step 6: Shipment
    const step6 = await ShipmentDetail.findByRootCardId(rootCard.rootCardId);
    if (step6) stepData.step6_shipment = step6;

    // Step 7: Delivery
    const step7 = await DeliveryDetail.findByRootCardId(rootCard.rootCardId);
    if (step7) stepData.step7_delivery = step7;

    // Active BOM & Operations
    const ComprehensiveBOM = require('../../models/ComprehensiveBOM');
    const activeBOMRef = await ComprehensiveBOM.findByRootCardId(rootCard.rootCardId);
    if (activeBOMRef) {
      const fullBOM = await ComprehensiveBOM.findById(activeBOMRef.id);
      if (fullBOM) {
        stepData.activeBOM = fullBOM;
      }
    }

    res.json({
      ...rootCard,
      allSteps,
      stepData,
      userAssignedSteps,
      userAssignedStages
    });
  } catch (error) {
    console.error('Get root card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProductionStages = async (req, res) => {
  try {
    const ProductionStage = require('../../models/ProductionStage');
    const { status, executionType } = req.query;

    const filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (executionType && executionType !== 'all') {
      filters.executionType = executionType;
    }

    const stages = await ProductionStage.findAll(filters);

    const stats = {
      totalStages: stages.length,
      inProgressStages: stages.filter(s => s.status === 'in_progress').length,
      pendingStages: stages.filter(s => s.status === 'pending').length,
      completedStages: stages.filter(s => s.status === 'completed').length,
      onHoldStages: stages.filter(s => s.status === 'on_hold').length,
      inHouseStages: stages.filter(s => s.execution_type === 'in-house').length,
      outsourceStages: stages.filter(s => s.execution_type === 'outsource').length
    };

    res.json({ stages, stats });
  } catch (error) {
    console.error('Get production stages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const pool = require('../../config/database');
    
    // Fetch only registered employees from the Production department
    const [rows] = await pool.execute(`
      SELECT 
        e.id as emp_id,
        u.id as user_id,
        e.login_id as employee_id_str,
        COALESCE(CONCAT(e.first_name, ' ', e.last_name), u.username) as display_name,
        COALESCE(e.email, u.email) as email, 
        COALESCE(e.designation, r.name, 'Staff') as designation, 
        d.name as department_name
      FROM employees e
      INNER JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON (e.email = u.email AND e.email IS NOT NULL)
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE e.status = 'active' AND (d.name = 'Production' OR d.name = 'PRODUCTION' OR d.name = 'Production Department')
      ORDER BY display_name ASC
    `);
    
    const employees = rows.map(emp => ({
      id: emp.emp_id,
      user_id: emp.user_id,
      employee_id: emp.employee_id_str,
      name: emp.display_name,
      username: emp.display_name,
      email: emp.email,
      designation: emp.designation,
      department: emp.department_name
    }));

    console.log('[getEmployees] Returning all available personnel:', employees.length);
    res.json(employees);
  } catch (error) {
    console.error('[getEmployees] Error:', error);
    res.status(500).json({ message: 'Failed to fetch personnel' });
  }
};

exports.createManufacturingStages = async (req, res) => {
  try {
    const ManufacturingStage = require('../../models/ManufacturingStage');
    const RootCard = require('../../models/RootCard');
    const EmployeeTask = require('../../models/EmployeeTask');
    const pool = require('../../config/database');
    const stages = req.body;

    console.log('[createManufacturingStages] Received stages:', JSON.stringify(stages, null, 2));

    if (!Array.isArray(stages) || stages.length === 0) {
      return res.status(400).json({ message: 'Stages array is required' });
    }

    for (const stage of stages) {
      if (!stage.rootCardId || !stage.stageName) {
        return res.status(400).json({ message: 'Each stage must have rootCardId and stageName' });
      }
      
      const rootCard = await RootCard.findById(stage.rootCardId);
      if (!rootCard) {
        return res.status(400).json({ message: `Root card ${stage.rootCardId} not found` });
      }
    }

    console.log('[createManufacturingStages] Creating', stages.length, 'stages...');
    const createdStages = await ManufacturingStage.createMany(stages);
    console.log('[createManufacturingStages] ✓ Successfully created', stages.length, 'stages');

    console.log('[createManufacturingStages] Creating worker tasks for assigned stages removed as per user request...');
    /*
    let tasksCreated = 0;
    for (const createdStage of createdStages) {
      if (createdStage.assignedWorker) {
        try {
          await EmployeeTask.create(createdStage.id, createdStage.assignedWorker, `${createdStage.stageName} - Production Stage`);
          tasksCreated++;
          console.log(`[createManufacturingStages] ✓ Created task for stage: ${createdStage.stageName} (worker: ${createdStage.assignedWorker}, stageId: ${createdStage.id})`);
        } catch (taskError) {
          console.error(`[createManufacturingStages] Error creating task for stage ${createdStage.stageName}:`, taskError.message);
        }
      }
    }
    */

    res.json({ 
      message: 'Manufacturing stages created successfully',
      createdCount: stages.length,
      tasksCreated: 0
    });
  } catch (error) {
    console.error('[createManufacturingStages] Error:', error.message);
    console.error('[createManufacturingStages] Code:', error.code);
    console.error('[createManufacturingStages] SQL State:', error.sqlState);
    console.error('[createManufacturingStages] Stack:', error.stack);
    res.status(500).json({ message: 'Failed to create manufacturing stages: ' + error.message });
  }
};

exports.getProductionFormRootCards = async (req, res) => {
  try {
    const RootCard = require('../../models/RootCard');
    const pool = require('../../config/database');
    const userId = parseInt(req.user.id);
    const { status, search, all } = req.query;

    const filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (search) {
      filters.search = search;
    }

    const allRootCards = await RootCard.findAll(filters);

    // Filter to only show root cards that have been "Sent to Production" in sales_orders_management
    const [sentOrders] = await pool.execute(
      "SELECT id, root_card_id FROM sales_orders_management WHERE status = 'Sent to Production'"
    );
    
    // Create a map for quick lookup
    const sentOrderMap = {};
    sentOrders.forEach(o => {
      sentOrderMap[o.root_card_id] = o.id;
    });

    const authorizedRootCards = allRootCards.filter(card => 
      sentOrderMap[card.id] !== undefined
    ).map(card => ({
      ...card,
      sales_management_id: sentOrderMap[card.id]
    }));

    if (all === 'true' || req.user.role === 'Admin' || req.user.role === 'Production') {
      return res.json({ rootCards: authorizedRootCards });
    }

    const [assignedSteps] = await pool.execute(
      'SELECT DISTINCT sales_order_id FROM sales_order_steps WHERE assigned_to = ? AND step_id >= 2 AND step_id <= 7',
      [userId]
    );

    if (assignedSteps.length === 0) {
      return res.json({ rootCards: [] });
    }

    const assignedSalesOrderIds = assignedSteps.map(s => s.sales_order_id);
    
    const filteredCards = authorizedRootCards.filter(card => 
      card.sales_order_id && assignedSalesOrderIds.includes(card.sales_order_id)
    );

    res.json({ rootCards: filteredCards });
  } catch (error) {
    console.error('Get production form root cards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateManufacturingStage = async (req, res) => {
  try {
    const ManufacturingStage = require('../../models/ManufacturingStage');
    const { id } = req.params;
    const { stageName, stageType, assignedWorker, plannedStart, plannedEnd, status, targetWarehouse, notes } = req.body;

    const stage = await ManufacturingStage.findById(id);
    if (!stage) {
      return res.status(404).json({ message: 'Manufacturing stage not found' });
    }

    await ManufacturingStage.update(id, {
      stageName,
      stageType,
      assignedWorker,
      plannedStart,
      plannedEnd,
      status,
      targetWarehouse,
      notes
    });

    const updatedStage = await ManufacturingStage.findById(id);

    res.json({
      message: 'Manufacturing stage updated successfully',
      stage: updatedStage
    });
  } catch (error) {
    console.error('Update manufacturing stage error:', error);
    res.status(500).json({ message: 'Failed to update manufacturing stage' });
  }
};

exports.getOutsourceTasks = async (req, res) => {
  try {
    const pool = require('../../config/database');
    
    console.log('[ProductionPortalController.getOutsourceTasks] Fetching outsource tasks for production department');
    
    const [outsourceTasks] = await pool.execute(`
      SELECT 
        pps.id as stage_id,
        pps.stage_name,
        pps.stage_type,
        COALESCE(ot.status, pps.status) as status,
        pps.planned_start_date,
        pps.planned_end_date,
        pps.notes,
        pps.created_at,
        pps.updated_at,
        pp.id as plan_id,
        pp.plan_name,
        rc.id as root_card_id,
        p.name as project_name,
        p.code as project_code,
        rc.title as root_card_title,
        ot.id as outsourcing_task_id,
        ot.product_name as ot_product_name,
        so.items as so_items,
        sod.product_details,
        JSON_UNQUOTE(JSON_EXTRACT(cpd.project_requirements, '$.numberOfUnits')) as planned_quantity
      FROM production_plan_stages pps
      LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
      LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
      LEFT JOIN projects p ON rc.project_id = p.id
      LEFT JOIN sales_orders so ON so.id = COALESCE(pp.sales_order_id, p.sales_order_id, rc.sales_order_id)
      LEFT JOIN outsourcing_tasks ot ON pps.id = ot.production_plan_stage_id
      LEFT JOIN sales_order_details sod ON sod.sales_order_id = COALESCE(pp.sales_order_id, p.sales_order_id, rc.sales_order_id)
      LEFT JOIN client_po_details cpd ON cpd.sales_order_id = COALESCE(pp.sales_order_id, p.sales_order_id, rc.sales_order_id)
      WHERE pps.stage_type = 'outsource'
      ORDER BY pps.created_at DESC
    `);
    
    // Parse product details and add product name
    const formattedTasks = outsourceTasks.map(task => {
      let product_name = task.ot_product_name;
      
      // 1. Try product details from sod
      if (!product_name || product_name === '-') {
        try {
          if (task.product_details) {
            const productDetails = typeof task.product_details === 'string' 
              ? JSON.parse(task.product_details) 
              : task.product_details;
            
            if (productDetails?.itemName && productDetails.itemName !== '-') {
              product_name = productDetails.itemName;
            }
          }
        } catch (e) {}
      }

      // 2. Try items from sales order
      if (!product_name || product_name === '-') {
        try {
          if (task.so_items) {
            const items = typeof task.so_items === 'string' ? JSON.parse(task.so_items) : task.so_items;
            if (Array.isArray(items) && items.length > 0) {
              product_name = items[0].name || items[0].itemName;
            }
          }
        } catch (e) {}
      }

      // 3. Fallback to root card title
      if (!product_name || product_name === '-') {
        product_name = task.root_card_title || '-';
      }

      return { 
        ...task, 
        product_name, 
        product_details: undefined, 
        so_items: undefined,
        ot_product_name: undefined 
      };
    });
    
    console.log(`[ProductionPortalController.getOutsourceTasks] Found ${formattedTasks.length} outsource tasks`);
    
    res.json(formattedTasks);
  } catch (error) {
    console.error('Get outsource tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch outsource tasks', error: error.message });
  }
};

exports.updateOutsourceTaskStatus = async (req, res) => {
  try {
    const { stageId } = req.params;
    const { status, notes } = req.body;
    const pool = require('../../config/database');
    
    if (!['pending', 'in_progress', 'completed', 'on_hold', 'cancelled', 'outward_challan_generated', 'inward_challan_generated'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    console.log(`[ProductionPortalController.updateOutsourceTaskStatus] Updating stage ${stageId} to status ${status}`);
    
    // Update the stage status
    await pool.execute(
      `UPDATE production_plan_stages SET status = ?, notes = ? WHERE id = ?`,
      [status, notes || null, stageId]
    );
    
    console.log(`[ProductionPortalController.updateOutsourceTaskStatus] ✓ Stage ${stageId} updated to ${status}`);
    
    // If completed, unlock the next stage
    if (status === 'completed') {
      const [nextStages] = await pool.execute(
        `SELECT id, stage_name, stage_type, assigned_employee_id, production_plan_id FROM production_plan_stages WHERE blocked_by_stage_id = ? LIMIT 1`,
        [stageId]
      );
      
      if (nextStages.length > 0) {
        const nextStageId = nextStages[0].id;
        const nextStageName = nextStages[0].stage_name;
        const nextStageType = nextStages[0].stage_type;
        const nextStageEmployeeId = nextStages[0].assigned_employee_id;
        const planId = nextStages[0].production_plan_id;
        
        console.log(`[ProductionPortalController.updateOutsourceTaskStatus] Stage completion detected. Next stage: ${nextStageId}, Type: ${nextStageType}`);
        
        // Unlock the next stage
        await pool.execute(
          `UPDATE production_plan_stages SET is_blocked = FALSE WHERE id = ?`,
          [nextStageId]
        );
        console.log(`[ProductionPortalController.updateOutsourceTaskStatus] ✓ Stage ${nextStageId} unlocked`);
        
        // Create task for the unlocked stage
        if (nextStageType === 'outsource') {
          // Outsource stage - notify Production Department
          try {
            const AlertsNotification = require('../../models/AlertsNotification');
            
            // Get all management/admin users for Production Department
            const [deptMembers] = await pool.execute(`
              SELECT DISTINCT u.id 
              FROM users u 
              INNER JOIN roles r ON u.role_id = r.id 
              WHERE r.name = 'Production'
              LIMIT 20
            `);
            
            // Send notification to each department member
            for (const member of deptMembers) {
              try {
                await AlertsNotification.create({
                  userId: member.id,
                  alertType: 'outsource_task_created',
                  message: `Outsource task "${nextStageName}" is now ready for production. Previous stage completed!`,
                  relatedTable: 'production_plan_stages',
                  relatedId: nextStageId,
                  priority: 'high'
                });
                console.log(`[ProductionPortalController.updateOutsourceTaskStatus] ✓ Notification sent to employee ${member.id}`);
              } catch (notifErr) {
                console.warn(`[ProductionPortalController.updateOutsourceTaskStatus] Warning - could not send notification:`, notifErr.message);
              }
            }
          } catch (outsourceError) {
            console.error(`[ProductionPortalController.updateOutsourceTaskStatus] Error handling outsource stage:`, outsourceError.message);
          }
        /* 
        } else if (nextStageEmployeeId) {
          // In-house stage - create task for employee
          try {
            const EmployeeTask = require('../../models/EmployeeTask');
            const newTaskId = await EmployeeTask.createAssignedTask(nextStageEmployeeId, {
              title: `Production Stage: ${nextStageName}`,
              description: `Assigned to production plan stage`,
              type: 'production_stage',
              priority: 'medium',
              dueDate: null,
              notes: `Production Plan ID: ${planId}`,
              productionPlanStageId: nextStageId
            });
            console.log(`[ProductionPortalController.updateOutsourceTaskStatus] ✓ Task ${newTaskId} created for employee ${nextStageEmployeeId}`);
          } catch (createTaskError) {
            console.error(`[ProductionPortalController.updateOutsourceTaskStatus] Error creating task:`, createTaskError.message);
          }
        */
        }
      }
    }
    
    res.json({ 
      message: 'Outsource task status updated successfully',
      stageId,
      status
    });
  } catch (error) {
    console.error('[ProductionPortalController.updateOutsourceTaskStatus] Error:', error);
    res.status(500).json({ message: 'Failed to update outsource task status', error: error.message });
  }
};
