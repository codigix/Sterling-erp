const ShipmentDetail = require('../../models/ShipmentDetail');
const SalesOrderStep = require('../../models/SalesOrderStep');
const { validateShipment } = require('../../utils/salesOrderValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/salesOrderHelpers');

class ShipmentController {
  static async createOrUpdate(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const validation = validateShipment(data);
      if (!validation.isValid) {
        console.warn('Shipment validation warnings:', validation.errors);
      }

      let detail = await ShipmentDetail.findBySalesOrderId(salesOrderId);

      if (detail) {
        await ShipmentDetail.update(salesOrderId, data);
      } else {
        data.salesOrderId = salesOrderId;
        await ShipmentDetail.create(data);
      }

      const updated = await ShipmentDetail.findBySalesOrderId(salesOrderId);
      await SalesOrderStep.update(salesOrderId, 7, { status: 'in_progress', data: updated });

      res.json(formatSuccessResponse(updated, 'Shipment details saved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getShipment(req, res) {
    try {
      const { salesOrderId } = req.params;
      const detail = await ShipmentDetail.findBySalesOrderId(salesOrderId);
      res.json(formatSuccessResponse(detail || null, 'Shipment retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateShipmentStatus(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { status } = req.body;

      const validStatus = ['pending', 'prepared', 'dispatched', 'in_transit', 'delivered'];
      if (!validStatus.includes(status)) {
        return res.status(400).json(formatErrorResponse('Invalid shipment status'));
      }

      await ShipmentDetail.updateShipmentStatus(salesOrderId, status);
      await SalesOrderStep.update(salesOrderId, 7, { status: 'in_progress' });

      const updated = await ShipmentDetail.findBySalesOrderId(salesOrderId);
      res.json(formatSuccessResponse(updated, `Shipment status updated to ${status}`));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateDeliveryTerms(req, res) {
    try {
      const { salesOrderId } = req.params;
      const deliveryTermsData = req.body;

      await ShipmentDetail.updateDeliveryTerms(salesOrderId, deliveryTermsData);
      const updated = await ShipmentDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Delivery terms updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateShipmentProcess(req, res) {
    try {
      const { salesOrderId } = req.params;
      const shipmentProcessData = req.body;

      await ShipmentDetail.updateShipmentProcess(salesOrderId, shipmentProcessData);
      const updated = await ShipmentDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Shipment process updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async updateShippingDetails(req, res) {
    try {
      const { salesOrderId } = req.params;
      const shippingData = req.body;

      await ShipmentDetail.updateShippingDetails(salesOrderId, shippingData);
      const updated = await ShipmentDetail.findBySalesOrderId(salesOrderId);

      res.json(formatSuccessResponse(updated, 'Shipping details updated'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateShipment(req, res) {
    try {
      const { salesOrderId } = req.params;

      const detail = await ShipmentDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Shipment not found'));
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
