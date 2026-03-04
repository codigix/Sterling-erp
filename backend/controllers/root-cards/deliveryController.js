const DeliveryDetail = require('../../models/DeliveryDetail');
const RootCardStep = require('../../models/RootCardStep');
const EmployeeTask = require('../../models/EmployeeTask');
const { validateDelivery } = require('../../utils/rootCardValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/rootCardHelpers');

class DeliveryController {
  static async createOrUpdate(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;
      const { assignedTo } = req.body;

      const validation = validateDelivery(data);
      if (!validation.isValid) {
        console.warn('Delivery validation warnings:', validation.errors);
      }

      let detail = await DeliveryDetail.findByRootCardId(rootCardId);

      if (detail) {
        await DeliveryDetail.update(rootCardId, data);
      } else {
        data.rootCardId = rootCardId;
        await DeliveryDetail.create(data);
      }

      const updated = await DeliveryDetail.findByRootCardId(rootCardId);
      
      /* Task creation removed as per user request to keep them only in workflow tasks
      if (assignedTo) {
        await this.createOrUpdateDeliveryTask(rootCardId, assignedTo);
      }
      */

      await RootCardStep.update(rootCardId, 7, { status: 'in_progress', data: updated, assignedTo });
      
      if (assignedTo) {
        await RootCardStep.assignEmployee(rootCardId, 7, assignedTo);
      }

      res.json(formatSuccessResponse(updated, 'Delivery details saved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getDelivery(req, res) {
    try {
      const { rootCardId } = req.params;
      const detail = await DeliveryDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(detail || null, 'Delivery retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateDeliveryStatus(req, res) {
    try {
      const { rootCardId } = req.params;
      const { status } = req.body;

      const validStatus = ['pending', 'in_progress', 'delivered', 'failed', 'partial', 'complete', 'signed', 'cancelled'];
      if (!validStatus.includes(status)) {
        return res.status(400).json(formatErrorResponse('Invalid delivery status'));
      }

      let detail = await DeliveryDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await DeliveryDetail.create({ rootCardId, deliveryStatus: status });
      } else {
        await DeliveryDetail.updateDeliveryStatus(rootCardId, status);
      }
      
      await RootCardStep.update(rootCardId, 7, { status: 'in_progress' });

      const updated = await DeliveryDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, `Delivery status updated to ${status}`));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateFinalDelivery(req, res) {
    try {
      const { rootCardId } = req.params;
      const deliveryData = req.body;

      let detail = await DeliveryDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await DeliveryDetail.create({ rootCardId, delivery: deliveryData });
      } else {
        await DeliveryDetail.updateFinalDelivery(rootCardId, deliveryData);
      }
      
      const updated = await DeliveryDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Final delivery updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateInstallationStatus(req, res) {
    try {
      const { rootCardId } = req.params;
      const installationData = req.body;

      let detail = await DeliveryDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await DeliveryDetail.create({ rootCardId, delivery: installationData });
      } else {
        await DeliveryDetail.updateInstallationStatus(rootCardId, installationData);
      }
      
      const updated = await DeliveryDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Installation status updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateWarrantyInfo(req, res) {
    try {
      const { rootCardId } = req.params;
      const warrantyData = req.body;

      let detail = await DeliveryDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await DeliveryDetail.create({ rootCardId, delivery: warrantyData });
      } else {
        await DeliveryDetail.updateWarrantyInfo(rootCardId, warrantyData);
      }
      
      const updated = await DeliveryDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Warranty information updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateProjectCompletion(req, res) {
    try {
      const { rootCardId } = req.params;
      const completionData = req.body;

      let detail = await DeliveryDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await DeliveryDetail.create({ rootCardId, delivery: completionData });
      } else {
        await DeliveryDetail.updateProjectCompletion(rootCardId, completionData);
      }
      
      const updated = await DeliveryDetail.findByRootCardId(rootCardId);
      await RootCardStep.update(rootCardId, 7, { status: 'completed', data: updated });

      res.json(formatSuccessResponse(updated, 'Project completion updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateInternalInfo(req, res) {
    try {
      const { rootCardId } = req.params;
      const internalData = req.body;

      let detail = await DeliveryDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await DeliveryDetail.create({ rootCardId, ...internalData });
      } else {
        await DeliveryDetail.updateInternalInfo(rootCardId, internalData);
      }
      
      const updated = await DeliveryDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Internal information updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateDelivery(req, res) {
    try {
      const { rootCardId } = req.params;

      const detail = await DeliveryDetail.findByRootCardId(rootCardId);
      if (!detail) {
        return res.json(formatSuccessResponse({
          isValid: true,
          errors: [],
          warnings: ['Delivery data not yet initialized'],
          deliveryData: null
        }, 'Delivery validation completed (no data)'));
      }

      const errors = [];
      const warnings = [];

      if (!detail.deliveryTerms && !detail.delivery?.actualDeliveryDate) {
        warnings.push('No delivery terms or actual delivery date specified');
      }

      if (!detail.customerContact && !detail.delivery?.customerContact) {
        warnings.push('Customer contact information not provided');
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings,
        deliveryData: detail
      }, 'Delivery validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = DeliveryController;
