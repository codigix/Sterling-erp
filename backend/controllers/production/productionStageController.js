const ProductionStage = require('../../models/ProductionStage');
const ProductionPlan = require('../../models/ProductionPlan');

exports.createProductionStage = async (req, res) => {
  const {
    productionPlanId,
    stageSequence,
    stageName,
    stageType,
    executionType,
    assignedEmployeeId,
    assignedVendorId,
    plannedStartDate,
    plannedEndDate,
    estimatedDurationDays,
    delayToleranceDays,
    notes
  } = req.body;

  if (!productionPlanId || stageSequence === undefined || !stageName) {
    return res.status(400).json({
      message: 'Production plan ID, stage sequence, and stage name are required'
    });
  }

  if (executionType === 'outsource' && !assignedVendorId) {
    return res.status(400).json({
      message: 'Vendor is required for outsourced stages'
    });
  }

  if (executionType === 'in-house' && !assignedEmployeeId) {
    return res.status(400).json({
      message: 'Employee is required for in-house stages'
    });
  }

  try {
    const productionStageId = await ProductionStage.create({
      productionPlanId,
      stageSequence: Number(stageSequence),
      stageName: stageName.trim(),
      stageType: stageType || 'manufacturing',
      executionType: executionType || 'in-house',
      assignedEmployeeId: assignedEmployeeId || null,
      assignedVendorId: assignedVendorId || null,
      plannedStartDate: plannedStartDate || null,
      plannedEndDate: plannedEndDate || null,
      estimatedDurationDays: estimatedDurationDays ? Number(estimatedDurationDays) : null,
      delayToleranceDays: delayToleranceDays ? Number(delayToleranceDays) : null,
      status: 'pending',
      notes: notes || null
    });

    const createdStage = await ProductionStage.findById(productionStageId);

    res.status(201).json({
      message: 'Production stage created successfully',
      productionStage: createdStage
    });
  } catch (error) {
    console.error('Create production stage error:', error.message);
    res.status(500).json({ message: 'Failed to create production stage' });
  }
};

exports.getProductionStage = async (req, res) => {
  const { id } = req.params;

  try {
    const productionStage = await ProductionStage.findById(id);

    if (!productionStage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    res.json({ productionStage });
  } catch (error) {
    console.error('Get production stage error:', error.message);
    res.status(500).json({ message: 'Failed to fetch production stage' });
  }
};

exports.getProductionStagesByPlan = async (req, res) => {
  const { productionPlanId } = req.params;

  try {
    const stages = await ProductionStage.findByProductionPlan(productionPlanId);

    res.json({
      stages,
      total: stages.length
    });
  } catch (error) {
    console.error('Get production stages error:', error.message);
    res.status(500).json({ message: 'Failed to fetch production stages' });
  }
};

exports.getAllProductionStages = async (req, res) => {
  const { productionPlanId, status, executionType, assignedEmployeeId } = req.query;

  try {
    const stages = await ProductionStage.findAll({
      productionPlanId,
      status,
      executionType,
      assignedEmployeeId
    });

    const stats = await ProductionStage.getStats();

    res.json({
      stages,
      stats,
      total: stages.length
    });
  } catch (error) {
    console.error('Get all production stages error:', error.message);
    res.status(500).json({ message: 'Failed to fetch production stages' });
  }
};

exports.updateProductionStage = async (req, res) => {
  const { id } = req.params;
  const {
    stageName,
    stageType,
    executionType,
    assignedEmployeeId,
    assignedVendorId,
    plannedStartDate,
    plannedEndDate,
    estimatedDurationDays,
    delayToleranceDays,
    notes,
    status
  } = req.body;

  if (executionType === 'outsource' && !assignedVendorId) {
    return res.status(400).json({
      message: 'Vendor is required for outsourced stages'
    });
  }

  if (executionType === 'in-house' && !assignedEmployeeId) {
    return res.status(400).json({
      message: 'Employee is required for in-house stages'
    });
  }

  try {
    const productionStage = await ProductionStage.findById(id);

    if (!productionStage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    await ProductionStage.update(id, {
      stageName,
      stageType,
      executionType,
      assignedEmployeeId,
      assignedVendorId,
      plannedStartDate,
      plannedEndDate,
      estimatedDurationDays,
      delayToleranceDays,
      notes,
      status
    });

    const updatedStage = await ProductionStage.findById(id);

    res.json({
      message: 'Production stage updated successfully',
      productionStage: updatedStage
    });
  } catch (error) {
    console.error('Update production stage error:', error.message);
    res.status(500).json({ message: 'Failed to update production stage' });
  }
};

exports.updateProductionStageStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'in_progress', 'on_hold', 'completed', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const productionStage = await ProductionStage.findById(id);

    if (!productionStage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    await ProductionStage.updateStatus(id, status);

    res.json({ message: 'Production stage status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

exports.deleteProductionStage = async (req, res) => {
  const { id } = req.params;

  try {
    const productionStage = await ProductionStage.findById(id);

    if (!productionStage) {
      return res.status(404).json({ message: 'Production stage not found' });
    }

    if (productionStage.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending production stages can be deleted'
      });
    }

    await ProductionStage.delete(id);

    res.json({ message: 'Production stage deleted successfully' });
  } catch (error) {
    console.error('Delete production stage error:', error.message);
    res.status(500).json({ message: 'Failed to delete production stage' });
  }
};
