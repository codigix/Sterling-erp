const QualityCheckDetail = require('../../models/QualityCheckDetail');
const SalesOrderStep = require('../../models/SalesOrderStep');
const { validateQualityCheck } = require('../../utils/salesOrderValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/salesOrderHelpers');

class QualityCheckController {
  static async createOrUpdate(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const validation = validateQualityCheck(data);
      if (!validation.isValid) {
        console.warn('Quality Check validation warnings:', validation.errors);
      }

      let detail = await QualityCheckDetail.findBySalesOrderId(salesOrderId);

      if (detail) {
        await QualityCheckDetail.update(salesOrderId, data);
      } else {
        data.salesOrderId = salesOrderId;
        await QualityCheckDetail.create(data);
      }

      const updated = await QualityCheckDetail.findBySalesOrderId(salesOrderId);
      await SalesOrderStep.update(salesOrderId, 6, { status: 'in_progress', data: updated });

      res.json(formatSuccessResponse(updated, 'Quality check data saved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getQualityCheck(req, res) {
    try {
      const { salesOrderId } = req.params;
      const detail = await QualityCheckDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Quality check data not found'));
      }
      res.json(formatSuccessResponse(detail, 'Quality check retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateQCStatus(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json(formatErrorResponse('Status is required'));
      }

      await QualityCheckDetail.updateQCStatus(salesOrderId, status);
      const updated = await QualityCheckDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'QC status updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addCompliance(req, res) {
    try {
      const { salesOrderId } = req.params;
      const complianceData = req.body;

      if (!complianceData.standard) {
        return res.status(400).json(formatErrorResponse('Compliance standard is required'));
      }

      await QualityCheckDetail.addCompliance(salesOrderId, complianceData);
      const updated = await QualityCheckDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Compliance added'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async addWarrantySupport(req, res) {
    try {
      const { salesOrderId } = req.params;
      const warrantyData = req.body;

      if (!warrantyData.period) {
        return res.status(400).json(formatErrorResponse('Warranty period is required'));
      }

      await QualityCheckDetail.addWarrantySupport(salesOrderId, warrantyData);
      const updated = await QualityCheckDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Warranty support added'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async assignProjectOwner(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { ownerId } = req.body;

      if (!ownerId) {
        return res.status(400).json(formatErrorResponse('Project owner ID is required'));
      }

      await QualityCheckDetail.assignProjectOwner(salesOrderId, ownerId);
      const updated = await QualityCheckDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Project owner assigned'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateCompliance(req, res) {
    try {
      const { salesOrderId } = req.params;

      const detail = await QualityCheckDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Quality check data not found'));
      }

      const errors = [];
      const warnings = [];

      if (!detail.qualityCompliance || Object.keys(detail.qualityCompliance).length === 0) {
        warnings.push('No quality compliance standards specified');
      }

      if (!detail.warrantySupport || Object.keys(detail.warrantySupport).length === 0) {
        warnings.push('No warranty support information provided');
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings,
        complianceData: detail
      }, 'Compliance validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = QualityCheckController;
