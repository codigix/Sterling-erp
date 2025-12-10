const SalesOrderDetail = require('../../models/SalesOrderDetail');
const SalesOrderStep = require('../../models/SalesOrderStep');
const SalesOrder = require('../../models/SalesOrder');
const {
  formatSuccessResponse,
  formatErrorResponse
} = require('../../utils/salesOrderHelpers');

class SalesOrderDetailController {
  static async createOrUpdate(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      let orderDetail = await SalesOrderDetail.findBySalesOrderId(salesOrderId);

      if (orderDetail) {
        await SalesOrderDetail.update(salesOrderId, data);
      } else {
        data.salesOrderId = salesOrderId;
        await SalesOrderDetail.create(data);
      }

      const updatedDetail = await SalesOrderDetail.findBySalesOrderId(salesOrderId);

      await SalesOrderStep.update(salesOrderId, 2, {
        status: 'in_progress',
        data: updatedDetail
      });

      res.json(formatSuccessResponse(updatedDetail, 'Sales Order details saved successfully'));
    } catch (error) {
      console.error('Error saving Sales Order details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getSalesOrderDetail(req, res) {
    try {
      const { salesOrderId } = req.params;

      const detail = await SalesOrderDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Sales Order details not found'));
      }

      res.json(formatSuccessResponse(detail, 'Sales Order details retrieved successfully'));
    } catch (error) {
      console.error('Error getting Sales Order details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateSalesAndProduct(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      let orderDetail = await SalesOrderDetail.findBySalesOrderId(salesOrderId);

      if (!orderDetail) {
        const initData = {
          salesOrderId: salesOrderId,
          ...data
        };
        await SalesOrderDetail.create(initData);
      } else {
        await SalesOrderDetail.updateSalesAndProduct(salesOrderId, data);
      }

      const salesAndProduct = await SalesOrderDetail.getSalesAndProduct(salesOrderId);

      res.json(formatSuccessResponse(salesAndProduct, 'Sales & Product details saved successfully'));
    } catch (error) {
      console.error('Error saving Sales & Product details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getSalesAndProduct(req, res) {
    try {
      const { salesOrderId } = req.params;

      const data = await SalesOrderDetail.getSalesAndProduct(salesOrderId);
      if (!data) {
        return res.status(404).json(formatErrorResponse('Sales & Product details not found'));
      }

      res.json(formatSuccessResponse(data, 'Sales & Product details retrieved successfully'));
    } catch (error) {
      console.error('Error getting Sales & Product details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateQualityAndCompliance(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      let orderDetail = await SalesOrderDetail.findBySalesOrderId(salesOrderId);

      if (!orderDetail) {
        const initData = {
          salesOrderId: salesOrderId,
          clientEmail: 'TBD',
          clientPhone: 'TBD',
          ...data
        };
        await SalesOrderDetail.create(initData);
      } else {
        await SalesOrderDetail.updateQualityAndCompliance(salesOrderId, data);
      }

      const qualityAndCompliance = await SalesOrderDetail.getQualityAndCompliance(salesOrderId);

      res.json(formatSuccessResponse(qualityAndCompliance, 'Quality & Compliance details saved successfully'));
    } catch (error) {
      console.error('Error saving Quality & Compliance details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getQualityAndCompliance(req, res) {
    try {
      const { salesOrderId } = req.params;

      const data = await SalesOrderDetail.getQualityAndCompliance(salesOrderId);
      if (!data) {
        return res.status(404).json(formatErrorResponse('Quality & Compliance details not found'));
      }

      res.json(formatSuccessResponse(data, 'Quality & Compliance details retrieved successfully'));
    } catch (error) {
      console.error('Error getting Quality & Compliance details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdatePaymentAndInternal(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      let orderDetail = await SalesOrderDetail.findBySalesOrderId(salesOrderId);

      if (!orderDetail) {
        const initData = {
          salesOrderId: salesOrderId,
          clientEmail: 'TBD',
          clientPhone: 'TBD',
          ...data
        };
        await SalesOrderDetail.create(initData);
      } else {
        await SalesOrderDetail.updatePaymentAndInternal(salesOrderId, data);
      }

      const paymentAndInternal = await SalesOrderDetail.getPaymentAndInternal(salesOrderId);

      res.json(formatSuccessResponse(paymentAndInternal, 'Payment & Internal details saved successfully'));
    } catch (error) {
      console.error('Error saving Payment & Internal details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getPaymentAndInternal(req, res) {
    try {
      const { salesOrderId } = req.params;

      const data = await SalesOrderDetail.getPaymentAndInternal(salesOrderId);
      if (!data) {
        return res.status(404).json(formatErrorResponse('Payment & Internal details not found'));
      }

      res.json(formatSuccessResponse(data, 'Payment & Internal details retrieved successfully'));
    } catch (error) {
      console.error('Error getting Payment & Internal details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async delete(req, res) {
    try {
      const { salesOrderId } = req.params;

      const detail = await SalesOrderDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Sales Order details not found'));
      }

      await SalesOrderDetail.delete(salesOrderId);

      await SalesOrderStep.update(salesOrderId, 2, {
        status: 'pending',
        data: null
      });

      res.json(formatSuccessResponse(null, 'Sales Order details deleted successfully'));
    } catch (error) {
      console.error('Error deleting Sales Order details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = SalesOrderDetailController;
