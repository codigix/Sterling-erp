const RootCardStep = require('../../models/RootCardStep');
const RootCard = require('../../models/RootCard');
const {
  formatSuccessResponse,
  formatErrorResponse,
  getStepByKey
} = require('../../utils/rootCardHelpers');

class RootCardStepController {
  static async getSteps(req, res) {
    try {
      const { rootCardId } = req.params;
      const userId = req.user?.id;

      let rootCard = await RootCard.findById(rootCardId);
      let isDraft = false;

      if (!rootCard && userId) {
        const RootCardDraft = require('../../models/RootCardDraft');
        rootCard = await RootCardDraft.findById(rootCardId, userId);
        if (rootCard) {
          isDraft = true;
        }
      }

      if (!rootCard) {
        return res.status(404).json(formatErrorResponse('Root Card not found'));
      }

      const steps = isDraft ? [] : await RootCardStep.findByRootCardId(rootCardId);
      const progress = isDraft ? { totalSteps: 7, completedSteps: 0, percentage: 0 } : await RootCardStep.getStepProgress(rootCardId);

      res.json(formatSuccessResponse({
        rootCardId,
        steps,
        progress,
        isDraft
      }, 'Steps retrieved successfully'));
    } catch (error) {
      console.error('Error getting steps:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getStepByKey(req, res) {
    try {
      const { rootCardId, stepKey } = req.params;

      const step = await RootCardStep.findByStepKey(rootCardId, stepKey);
      res.json(formatSuccessResponse(step || null, 'Step retrieved successfully'));
    } catch (error) {
      console.error('Error getting step:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateStepStatus(req, res) {
    try {
      const { rootCardId, stepKey } = req.params;
      const { status, notes } = req.body;

      const step = await RootCardStep.findByStepKey(rootCardId, stepKey);
      if (!step) {
        return res.status(404).json(formatErrorResponse('Step not found'));
      }

      if (status === 'in_progress' && step.status === 'pending') {
        await RootCardStep.startStep(rootCardId, step.stepId);
        if (notes) {
          await RootCardStep.updateStatus(rootCardId, step.stepId, status, { notes });
        }
      } else if (status === 'completed') {
        await RootCardStep.completeStep(rootCardId, step.stepId);
        if (notes) {
          await RootCardStep.updateStatus(rootCardId, step.stepId, status, { notes });
        }
      } else {
        await RootCardStep.updateStatus(rootCardId, step.stepId, status, { notes });
      }

      const updatedStep = await RootCardStep.findByStepKey(rootCardId, stepKey);

      res.json(formatSuccessResponse(updatedStep, `Step status updated to ${status}`));
    } catch (error) {
      console.error('Error updating step status:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async assignEmployeeToStep(req, res) {
    try {
      const { rootCardId, stepKey } = req.params;
      const { employeeId } = req.body;

      if (!employeeId) {
        return res.status(400).json(formatErrorResponse('Employee ID is required'));
      }

      const step = await RootCardStep.findByStepKey(rootCardId, stepKey);
      if (!step) {
        return res.status(404).json(formatErrorResponse('Step not found'));
      }

      await RootCardStep.assignEmployee(rootCardId, step.stepId, employeeId);

      const updatedStep = await RootCardStep.findByStepKey(rootCardId, stepKey);

      res.json(formatSuccessResponse(updatedStep, 'Employee assigned to step'));
    } catch (error) {
      console.error('Error assigning employee:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getStepProgress(req, res) {
    try {
      const { rootCardId } = req.params;

      const progress = await RootCardStep.getStepProgress(rootCardId);

      res.json(formatSuccessResponse(progress, 'Progress retrieved successfully'));
    } catch (error) {
      console.error('Error getting progress:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addNoteToStep(req, res) {
    try {
      const { rootCardId, stepKey } = req.params;
      const { notes } = req.body;

      if (!notes || !notes.trim()) {
        return res.status(400).json(formatErrorResponse('Notes are required'));
      }

      const step = await RootCardStep.findByStepKey(rootCardId, stepKey);
      if (!step) {
        return res.status(404).json(formatErrorResponse('Step not found'));
      }

      await RootCardStep.update(rootCardId, step.stepId, { 
        status: step.status, 
        notes 
      });

      const updatedStep = await RootCardStep.findByStepKey(rootCardId, stepKey);

      res.json(formatSuccessResponse(updatedStep, 'Note added successfully'));
    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getCompletedSteps(req, res) {
    try {
      const { rootCardId } = req.params;

      const completedSteps = await RootCardStep.getCompletedSteps(rootCardId);

      res.json(formatSuccessResponse({
        rootCardId,
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
      const { rootCardId } = req.params;

      const pendingSteps = await RootCardStep.getPendingSteps(rootCardId);

      res.json(formatSuccessResponse({
        rootCardId,
        pendingSteps,
        count: pendingSteps.length
      }, 'Pending steps retrieved successfully'));
    } catch (error) {
      console.error('Error getting pending steps:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = RootCardStepController;
