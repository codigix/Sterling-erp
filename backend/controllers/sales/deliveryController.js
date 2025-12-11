const DeliveryDetail = require('../../models/DeliveryDetail');
const SalesOrderStep = require('../../models/SalesOrderStep');
const EmployeeTask = require('../../models/EmployeeTask');
const { validateDelivery } = require('../../utils/salesOrderValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/salesOrderHelpers');

class DeliveryController {
  static async createOrUpdate(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const validation = validateDelivery(data);
      if (!validation.isValid) {
        console.warn('Delivery validation warnings:', validation.errors);
      }

      let detail = await DeliveryDetail.findBySalesOrderId(salesOrderId);

      if (detail) {
        await DeliveryDetail.update(salesOrderId, data);
      } else {
        data.salesOrderId = salesOrderId;
        await DeliveryDetail.create(data);
      }

      const updated = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      
      if (data.assignedTo) {
        await this.createOrUpdateDeliveryTask(salesOrderId, data.assignedTo);
      }

      await SalesOrderStep.update(salesOrderId, 8, { status: 'in_progress', data: updated });

      res.json(formatSuccessResponse(updated, 'Delivery details saved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateDeliveryTask(salesOrderId, employeeId) {
    try {
      const SalesOrder = require('../../models/SalesOrder');
      const pool = require('../../config/database');
      
      const salesOrder = await SalesOrder.findById(salesOrderId);
      
      if (!salesOrder) {
        return;
      }

      const taskTitle = `Delivery - ${salesOrder.poNumber || `Order #${salesOrderId}`}`;
      const taskDescription = `Deliver order to customer. PO: ${salesOrder.poNumber}, Project: ${salesOrder.projectName}`;

      await pool.execute(
        `INSERT INTO worker_tasks (worker_id, task, status, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE status = 'assigned', task = ?, updated_at = CURRENT_TIMESTAMP`,
        [
          parseInt(employeeId),
          taskTitle,
          'assigned',
          taskTitle
        ]
      );
    } catch (error) {
      console.error('Error creating delivery task:', error);
    }
  }

  static async getDelivery(req, res) {
    try {
      const { salesOrderId } = req.params;
      const detail = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      res.json(formatSuccessResponse(detail || null, 'Delivery retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateDeliveryStatus(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { status } = req.body;

      const validStatus = ['pending', 'in_progress', 'delivered', 'failed', 'partial', 'complete', 'signed', 'cancelled'];
      if (!validStatus.includes(status)) {
        return res.status(400).json(formatErrorResponse('Invalid delivery status'));
      }

      const detail = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Delivery not found'));
      }

      await DeliveryDetail.updateDeliveryStatus(salesOrderId, status);
      await SalesOrderStep.update(salesOrderId, 8, { status: 'in_progress' });

      const updated = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      res.json(formatSuccessResponse(updated, `Delivery status updated to ${status}`));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateFinalDelivery(req, res) {
    try {
      const { salesOrderId } = req.params;
      const deliveryData = req.body;

      const detail = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Delivery not found'));
      }

      await DeliveryDetail.updateFinalDelivery(salesOrderId, deliveryData);
      const updated = await DeliveryDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Final delivery updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateInstallationStatus(req, res) {
    try {
      const { salesOrderId } = req.params;
      const installationData = req.body;

      const detail = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Delivery not found'));
      }

      await DeliveryDetail.updateInstallationStatus(salesOrderId, installationData);
      const updated = await DeliveryDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Installation status updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateWarrantyInfo(req, res) {
    try {
      const { salesOrderId } = req.params;
      const warrantyData = req.body;

      const detail = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Delivery not found'));
      }

      await DeliveryDetail.updateWarrantyInfo(salesOrderId, warrantyData);
      const updated = await DeliveryDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Warranty information updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateProjectCompletion(req, res) {
    try {
      const { salesOrderId } = req.params;
      const completionData = req.body;

      const detail = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Delivery not found'));
      }

      await DeliveryDetail.updateProjectCompletion(salesOrderId, completionData);
      const updated = await DeliveryDetail.findBySalesOrderId(salesOrderId);

      await SalesOrderStep.update(salesOrderId, 8, { status: 'completed', data: updated });

      res.json(formatSuccessResponse(updated, 'Project completion updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateInternalInfo(req, res) {
    try {
      const { salesOrderId } = req.params;
      const internalData = req.body;

      const detail = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Delivery not found'));
      }

      await DeliveryDetail.updateInternalInfo(salesOrderId, internalData);
      const updated = await DeliveryDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Internal information updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateDelivery(req, res) {
    try {
      const { salesOrderId } = req.params;

      const detail = await DeliveryDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Delivery not found'));
      }

      const errors = [];
      const warnings = [];

      if (!detail.deliveryTerms || Object.keys(detail.deliveryTerms).length === 0) {
        warnings.push('No delivery terms specified');
      }

      if (!detail.warrantySupport || Object.keys(detail.warrantySupport).length === 0) {
        warnings.push('No warranty support information provided');
      }

      if (!detail.customerContact) {
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
