const ShipmentDetail = require('../../models/ShipmentDetail');
const RootCardStep = require('../../models/RootCardStep');
const { validateShipment } = require('../../utils/rootCardValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/rootCardHelpers');

class ShipmentController {
  static async createOrUpdate(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;
      const { assignedTo } = req.body;

      const validation = validateShipment(data);
      if (!validation.isValid) {
        console.warn('Shipment validation warnings:', validation.errors);
      }

      let detail = await ShipmentDetail.findByRootCardId(rootCardId);

      if (detail) {
        await ShipmentDetail.update(rootCardId, data);
      } else {
        data.rootCardId = rootCardId;
        await ShipmentDetail.create(data);
      }

      const updated = await ShipmentDetail.findByRootCardId(rootCardId);
      await RootCardStep.update(rootCardId, 6, { status: 'in_progress', data: updated, assignedTo });
      
      if (assignedTo) {
        await RootCardStep.assignEmployee(rootCardId, 6, assignedTo);

        try {
          const RootCard = require('../../models/RootCard');
          const EmployeeTask = require('../../models/EmployeeTask');
          const pool = require('../../config/database');
          
          const rootCard = await RootCard.findById(rootCardId);
          const existingTasks = await EmployeeTask.findByRelatedId(rootCardId, 'shipment');
          
          if (existingTasks.length === 0) {
            await EmployeeTask.createAssignedTask(assignedTo, {
              title: `Shipment Preparation: ${rootCard?.project_name || rootCard?.title || 'Project'}`,
              description: `Prepare shipment and logistics for Root Card ${rootCard?.po_number || ''}`,
              type: 'shipment',
              priority: rootCard?.priority || 'medium',
              dueDate: rootCard?.due_date,
              salesOrderId: rootCardId,
              notes: `Auto-assigned from Admin Root Card flow`
            });
            console.log(`[ShipmentController] ✓ Task created for employee ${assignedTo}`);
          } else {
            const task = existingTasks[0];
            if (task.employee_id !== parseInt(assignedTo)) {
              await pool.execute('UPDATE employee_tasks SET employee_id = ? WHERE id = ?', [assignedTo, task.id]);
              console.log(`[ShipmentController] ✓ Task ${task.id} reassigned to employee ${assignedTo}`);
            }
          }
        } catch (taskError) {
          console.error('[ShipmentController] Error handling employee task:', taskError.message);
        }
      }

      res.json(formatSuccessResponse(updated, 'Shipment details saved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getShipment(req, res) {
    try {
      const { rootCardId } = req.params;
      const detail = await ShipmentDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(detail || null, 'Shipment retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateShipmentStatus(req, res) {
    try {
      const { rootCardId } = req.params;
      const { status } = req.body;

      const validStatus = ['pending', 'prepared', 'dispatched', 'in_transit', 'delivered'];
      if (!validStatus.includes(status)) {
        return res.status(400).json(formatErrorResponse('Invalid shipment status'));
      }

      let detail = await ShipmentDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await ShipmentDetail.create({ rootCardId, shipmentStatus: status });
      } else {
        await ShipmentDetail.updateShipmentStatus(rootCardId, status);
      }
      
      await RootCardStep.update(rootCardId, 6, { status: 'in_progress' });

      const updated = await ShipmentDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, `Shipment status updated to ${status}`));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateDeliveryTerms(req, res) {
    try {
      const { rootCardId } = req.params;
      const deliveryTermsData = req.body;

      let detail = await ShipmentDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await ShipmentDetail.create({ rootCardId, deliveryTerms: deliveryTermsData });
      } else {
        await ShipmentDetail.updateDeliveryTerms(rootCardId, deliveryTermsData);
      }

      const updated = await ShipmentDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Delivery terms updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateShipmentProcess(req, res) {
    try {
      const { rootCardId } = req.params;
      const shipmentProcessData = req.body;

      let detail = await ShipmentDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await ShipmentDetail.create({ rootCardId, shipment: shipmentProcessData });
      } else {
        await ShipmentDetail.updateShipmentProcess(rootCardId, shipmentProcessData);
      }

      const updated = await ShipmentDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Shipment process updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateShippingDetails(req, res) {
    try {
      const { rootCardId } = req.params;
      const shippingData = req.body;

      let detail = await ShipmentDetail.findByRootCardId(rootCardId);
      if (!detail) {
        await ShipmentDetail.create({ rootCardId, ...shippingData });
      } else {
        await ShipmentDetail.updateShippingDetails(rootCardId, shippingData);
      }

      const updated = await ShipmentDetail.findByRootCardId(rootCardId);
      res.json(formatSuccessResponse(updated, 'Shipping details updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateShipment(req, res) {
    try {
      const { rootCardId } = req.params;

      const detail = await ShipmentDetail.findByRootCardId(rootCardId);
      if (!detail) {
        return res.json(formatSuccessResponse({
          isValid: true,
          errors: [],
          warnings: ['Shipment data not yet initialized'],
          shipmentData: null
        }, 'Shipment validation completed (no data)'));
      }

      const errors = [];
      const warnings = [];

      if (!detail.deliveryTerms || Object.keys(detail.deliveryTerms).length === 0) {
        warnings.push('No delivery terms specified');
      }

      if (!detail.shipment || Object.keys(detail.shipment).length === 0) {
        warnings.push('No shipment details provided');
      }

      res.json(formatSuccessResponse({
        isValid: errors.length === 0,
        errors,
        warnings,
        shipmentData: detail
      }, 'Shipment validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = ShipmentController;
