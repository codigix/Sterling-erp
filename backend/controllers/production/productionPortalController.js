exports.getRootCards = async (req, res) => {
  try {
    const RootCard = require('../../models/RootCard');
    const SalesOrderStep = require('../../models/SalesOrderStep');
    const pool = require('../../config/database');
    const userId = parseInt(req.user.id);
    const { status, search, all } = req.query;

    let filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (search) {
      filters.search = search;
    }

    const allRootCards = await RootCard.findAll(filters);

    if (all === 'true' || req.user.role === 'Admin' || req.user.role === 'Production') {
      const rootCardsWithStats = allRootCards.map(card => ({
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
      'SELECT DISTINCT sales_order_id FROM sales_order_steps WHERE assigned_to = ? AND step_id >= 3 AND step_id <= 8',
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
    
    const filteredCards = allRootCards.filter(card => 
      card.sales_order_id && assignedSalesOrderIds.includes(card.sales_order_id)
    );

    const rootCardsWithSteps = await Promise.all(
      filteredCards.map(async (card) => {
        const allSteps = await SalesOrderStep.findBySalesOrderId(card.sales_order_id);
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
    const SalesOrderStep = require('../../models/SalesOrderStep');
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
    
    if (rootCard.sales_order_id) {
      allSteps = await SalesOrderStep.findBySalesOrderId(rootCard.sales_order_id);
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
      console.log(`[RC ${id}] All Steps: ${allSteps.map(s => `${s.id}:${s.assignedTo}`).join(', ')}`);
      return res.status(403).json({ message: 'Access denied: Not assigned to any step or stage in this project' });
    }

    const stepData = {};
    
    const step3 = await DesignEngineeringDetail.findBySalesOrderId(rootCard.sales_order_id);
    if (step3) stepData.step3_designEngineering = step3;

    const step4 = await MaterialRequirementsDetail.findBySalesOrderId(rootCard.sales_order_id);
    if (step4) stepData.step4_materialRequirements = step4;

    const step5 = await ProductionPlanDetail.findBySalesOrderId(rootCard.sales_order_id);
    if (step5) stepData.step5_productionPlan = step5;

    const step6 = await QualityCheckDetail.findBySalesOrderId(rootCard.sales_order_id);
    if (step6) stepData.step6_qualityCheck = step6;

    const step7 = await ShipmentDetail.findBySalesOrderId(rootCard.sales_order_id);
    if (step7) stepData.step7_shipment = step7;

    const step8 = await DeliveryDetail.findBySalesOrderId(rootCard.sales_order_id);
    if (step8) stepData.step8_delivery = step8;

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
    
    const [rows] = await pool.execute(`
      SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) as username, e.email, e.designation, d.name as department_name
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.status = 'active' AND d.name = 'Production'
      ORDER BY e.first_name ASC
    `);
    
    const employees = rows.map(emp => ({
      id: emp.id,
      username: emp.username,
      email: emp.email,
      designation: emp.designation,
      department: emp.department_name
    }));

    console.log('[getEmployees] Returning Production employees:', employees);
    res.json(employees);
  } catch (error) {
    console.error('[getEmployees] Error:', error);
    const pool = require('../../config/database');
    const [rows] = await pool.execute(`
      SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) as username, e.email, e.designation, d.name as department_name
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.status = 'active'
      ORDER BY e.first_name ASC
    `);
    
    const employees = rows.map(emp => ({
      id: emp.id,
      username: emp.username,
      email: emp.email,
      designation: emp.designation,
      department: emp.department_name
    }));
    
    res.json(employees);
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

    console.log('[createManufacturingStages] Creating worker tasks for assigned stages...');
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

    console.log(`[createManufacturingStages] ✓ Created ${tasksCreated} worker tasks`);

    res.json({ 
      message: 'Manufacturing stages created successfully',
      createdCount: stages.length,
      tasksCreated: tasksCreated
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

    if (all === 'true' || req.user.role === 'Admin' || req.user.role === 'Production') {
      return res.json({ rootCards: allRootCards });
    }

    const [assignedSteps] = await pool.execute(
      'SELECT DISTINCT sales_order_id FROM sales_order_steps WHERE assigned_to = ? AND step_id >= 3 AND step_id <= 8',
      [userId]
    );

    if (assignedSteps.length === 0) {
      return res.json({ rootCards: [] });
    }

    const assignedSalesOrderIds = assignedSteps.map(s => s.sales_order_id);
    
    const filteredCards = allRootCards.filter(card => 
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
    const { stageName, stageType, assignedWorker, plannedStart, plannedEnd, status, notes } = req.body;

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
        rc.title as project_name,
        p.code as project_code,
        ot.id as outsourcing_task_id
      FROM production_plan_stages pps
      LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
      LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
      LEFT JOIN projects p ON rc.project_id = p.id
      LEFT JOIN outsourcing_tasks ot ON pps.id = ot.production_plan_stage_id
      WHERE pps.stage_type = 'outsource'
      ORDER BY pps.created_at DESC
    `);
    
    console.log(`[ProductionPortalController.getOutsourceTasks] Found ${outsourceTasks.length} outsource tasks`);
    
    res.json(outsourceTasks);
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
    
    if (!['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'].includes(status)) {
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
            
            // Get all employees in Production Department
            const [deptMembers] = await pool.execute(`
              SELECT DISTINCT e.id 
              FROM employees e
              WHERE e.department = 'Production' OR e.department_name = 'Production'
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
