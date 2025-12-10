const SalesOrderStep = require('../../models/SalesOrderStep');
const SalesOrder = require('../../models/SalesOrder');
const {
  formatSuccessResponse,
  formatErrorResponse,
  getStepByKey
} = require('../../utils/salesOrderHelpers');

class SalesOrderStepController {
  static async getSteps(req, res) {
    try {
      const { salesOrderId } = req.params;

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      const steps = await SalesOrderStep.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse({
        salesOrderId,
        steps,
        progress: await SalesOrderStep.getStepProgress(salesOrderId)
      }, 'Steps retrieved successfully'));
    } catch (error) {
      console.error('Error getting steps:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getStepByKey(req, res) {
    try {
      const { salesOrderId, stepKey } = req.params;

      const step = await SalesOrderStep.findByStepKey(salesOrderId, stepKey);
      if (!step) {
        return res.status(404).json(formatErrorResponse('Step not found'));
      }

      res.json(formatSuccessResponse(step, 'Step retrieved successfully'));
    } catch (error) {
      console.error('Error getting step:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateStepStatus(req, res) {
    try {
      const { salesOrderId, stepKey } = req.params;
      const { status, notes } = req.body;

      const step = await SalesOrderStep.findByStepKey(salesOrderId, stepKey);
      if (!step) {
        return res.status(404).json(formatErrorResponse('Step not found'));
      }

      if (status === 'in_progress' && step.status === 'pending') {
        await SalesOrderStep.startStep(salesOrderId, step.stepId);
      } else if (status === 'completed') {
        await SalesOrderStep.completeStep(salesOrderId, step.stepId);
      } else {
        await SalesOrderStep.updateStatus(salesOrderId, step.stepId, status);
      }

      if (notes) {
        await SalesOrderStep.update(salesOrderId, step.stepId, { status, notes });
      }

      const updatedStep = await SalesOrderStep.findByStepKey(salesOrderId, stepKey);

      res.json(formatSuccessResponse(updatedStep, `Step status updated to ${status}`));
    } catch (error) {
      console.error('Error updating step status:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async assignEmployeeToStep(req, res) {
    try {
      const { salesOrderId, stepKey } = req.params;
      const { employeeId } = req.body;

      if (!employeeId) {
        return res.status(400).json(formatErrorResponse('Employee ID is required'));
      }

      const step = await SalesOrderStep.findByStepKey(salesOrderId, stepKey);
      if (!step) {
        return res.status(404).json(formatErrorResponse('Step not found'));
      }

      await SalesOrderStep.assignEmployee(salesOrderId, step.stepId, employeeId);

      const updatedStep = await SalesOrderStep.findByStepKey(salesOrderId, stepKey);

      res.json(formatSuccessResponse(updatedStep, 'Employee assigned to step'));
    } catch (error) {
      console.error('Error assigning employee:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getStepProgress(req, res) {
    try {
      const { salesOrderId } = req.params;

      const progress = await SalesOrderStep.getStepProgress(salesOrderId);

      res.json(formatSuccessResponse(progress, 'Progress retrieved successfully'));
    } catch (error) {
      console.error('Error getting progress:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addNoteToStep(req, res) {
    try {
      const { salesOrderId, stepKey } = req.params;
      const { notes } = req.body;

      if (!notes || !notes.trim()) {
        return res.status(400).json(formatErrorResponse('Notes are required'));
      }

      const step = await SalesOrderStep.findByStepKey(salesOrderId, stepKey);
      if (!step) {
        return res.status(404).json(formatErrorResponse('Step not found'));
      }

      await SalesOrderStep.update(salesOrderId, step.stepId, { 
        status: step.status, 
        notes 
      });

      const updatedStep = await SalesOrderStep.findByStepKey(salesOrderId, stepKey);

      res.json(formatSuccessResponse(updatedStep, 'Note added successfully'));
    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getCompletedSteps(req, res) {
    try {
      const { salesOrderId } = req.params;

      const completedSteps = await SalesOrderStep.getCompletedSteps(salesOrderId);

      res.json(formatSuccessResponse({
        salesOrderId,
        completedSteps,
        count: completedSteps.length
      }, 'Completed steps retrieved successfully'));
    } catch (error) {
      console.error('Error getting completed steps:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getPendingSteps(req, res) {
    try {
      const { salesOrderId } = req.params;

      const pendingSteps = await SalesOrderStep.getPendingSteps(salesOrderId);

      res.json(formatSuccessResponse({
        salesOrderId,
        pendingSteps,
        count: pendingSteps.length
      }, 'Pending steps retrieved successfully'));
    } catch (error) {
      console.error('Error getting pending steps:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = SalesOrderStepController;
