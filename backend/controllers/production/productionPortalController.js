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
