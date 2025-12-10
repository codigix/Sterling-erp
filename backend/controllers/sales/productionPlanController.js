const ProductionPlanDetail = require('../../models/ProductionPlanDetail');
const SalesOrderStep = require('../../models/SalesOrderStep');
const { validateProductionPlan } = require('../../utils/salesOrderValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/salesOrderHelpers');

class ProductionPlanController {
  static async createOrUpdate(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const validation = validateProductionPlan(data);
      if (!validation.isValid) {
        console.warn('Production Plan validation warnings:', validation.errors);
      }

      let detail = await ProductionPlanDetail.findBySalesOrderId(salesOrderId);

      if (detail) {
        await ProductionPlanDetail.update(salesOrderId, data);
      } else {
        data.salesOrderId = salesOrderId;
        await ProductionPlanDetail.create(data);
      }

      const updated = await ProductionPlanDetail.findBySalesOrderId(salesOrderId);
      await SalesOrderStep.update(salesOrderId, 5, { status: 'in_progress', data: updated });

      res.json(formatSuccessResponse(updated, 'Production plan saved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getProductionPlan(req, res) {
    try {
      const { salesOrderId } = req.params;
      const detail = await ProductionPlanDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Production plan not found'));
      }
      res.json(formatSuccessResponse(detail, 'Production plan retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateTimeline(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { startDate, endDate } = req.body;

      const errors = [];
      const warnings = [];

      if (!startDate) {
        errors.push('Start date is required');
      }

      if (!endDate) {
        errors.push('End date is required');
      }

      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        errors.push('End date must be after start date');
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings
      }, 'Timeline validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validatePhases(req, res) {
    try {
      const { salesOrderId } = req.params;

      const detail = await ProductionPlanDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Production plan not found'));
      }

      const errors = [];
      const warnings = [];

      if (!detail.selectedPhases || Object.keys(detail.selectedPhases).length === 0) {
        warnings.push('No production phases selected');
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings,
        phases: detail.selectedPhases || {}
      }, 'Phase validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addPhase(req, res) {
    try {
      const { salesOrderId } = req.params;
      const phaseData = req.body;

      if (!phaseData.phaseName) {
        return res.status(400).json(formatErrorResponse('Phase name is required'));
      }

      await ProductionPlanDetail.addPhase(salesOrderId, phaseData);
      const updated = await ProductionPlanDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Production phase added'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getPhases(req, res) {
    try {
      const { salesOrderId } = req.params;

      const phases = await ProductionPlanDetail.getPhases(salesOrderId);
      res.json(formatSuccessResponse(phases, 'Production phases retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getPhase(req, res) {
    try {
      const { salesOrderId, phaseKey } = req.params;

      const phase = await ProductionPlanDetail.getPhase(salesOrderId, phaseKey);
      if (!phase) {
        return res.status(404).json(formatErrorResponse('Phase not found'));
      }

      res.json(formatSuccessResponse(phase, 'Production phase retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updatePhase(req, res) {
    try {
      const { salesOrderId, phaseKey } = req.params;
      const updateData = req.body;

      await ProductionPlanDetail.updatePhase(salesOrderId, phaseKey, updateData);
      const updated = await ProductionPlanDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Production phase updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async removePhase(req, res) {
    try {
      const { salesOrderId, phaseKey } = req.params;

      await ProductionPlanDetail.removePhase(salesOrderId, phaseKey);
      const updated = await ProductionPlanDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Production phase removed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updatePhaseStatus(req, res) {
    try {
      const { salesOrderId, phaseKey } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json(formatErrorResponse('Status is required'));
      }

      await ProductionPlanDetail.updatePhaseStatus(salesOrderId, phaseKey, status);
      const updated = await ProductionPlanDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Phase status updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = ProductionPlanController;
