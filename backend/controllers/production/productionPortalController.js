exports.getRootCards = async (req, res) => {
  try {
    const RootCard = require('../../models/RootCard');
    const SalesOrderStep = require('../../models/SalesOrderStep');
    const pool = require('../../config/database');
    const userId = parseInt(req.user.id);
    const { status, search } = req.query;

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
    
    const filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (search) {
      filters.search = search;
    }

    const allRootCards = await RootCard.findAll(filters);
    
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
    const userId = parseInt(req.user.id);

    const rootCard = await RootCard.findById(id);
    
    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    let userAssignedSteps = [];
    let allSteps = [];
    
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
    
    if (userAssignedSteps.length === 0 && userAssignedStages.length === 0) {
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
    const Employee = require('../../models/Employee');
    
    const productionEmployees = await Employee.findByDepartmentName('Production');
    
    const employees = productionEmployees.map(emp => ({
      id: emp.id,
      username: `${emp.first_name} ${emp.last_name}`,
      email: emp.email,
      role_name: emp.role_name,
      designation: emp.designation,
      department: emp.department_name || emp.department,
      departmentId: emp.department_id
    }));

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    const User = require('../../models/User');
    const users = await User.findAll();
    
    const employees = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role_name: user.role_name
    }));

    res.json(employees);
  }
};

exports.createManufacturingStages = async (req, res) => {
  try {
    const ManufacturingStage = require('../../models/ManufacturingStage');
    const stages = req.body;

    if (!Array.isArray(stages) || stages.length === 0) {
      return res.status(400).json({ message: 'Stages array is required' });
    }

    for (const stage of stages) {
      if (!stage.rootCardId || !stage.stageName) {
        return res.status(400).json({ message: 'Each stage must have rootCardId and stageName' });
      }
    }

    await ManufacturingStage.createMany(stages);

    res.json({ 
      message: 'Manufacturing stages created successfully',
      createdCount: stages.length
    });
  } catch (error) {
    console.error('Create manufacturing stages error:', error);
    res.status(500).json({ message: 'Failed to create manufacturing stages' });
  }
};

exports.getProductionFormRootCards = async (req, res) => {
  try {
    const RootCard = require('../../models/RootCard');
    const pool = require('../../config/database');
    const userId = parseInt(req.user.id);
    const { status, search } = req.query;

    const [assignedSteps] = await pool.execute(
      'SELECT DISTINCT sales_order_id FROM sales_order_steps WHERE assigned_to = ? AND step_id >= 3 AND step_id <= 8',
      [userId]
    );

    if (assignedSteps.length === 0) {
      return res.json({ rootCards: [] });
    }

    const assignedSalesOrderIds = assignedSteps.map(s => s.sales_order_id);
    
    const filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }
    if (search) {
      filters.search = search;
    }

    const allRootCards = await RootCard.findAll(filters);
    
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
