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

      // Sync product name to main Sales Order items if available
      if (data.productDetails && data.productDetails.itemName) {
        try {
          const salesOrder = await SalesOrder.findById(salesOrderId);
          if (salesOrder) {
            let items = [];
            try {
              items = typeof salesOrder.items === 'string' ? JSON.parse(salesOrder.items) : (salesOrder.items || []);
            } catch (e) {
              items = [];
            }
            
            if (items.length === 0) {
              items.push({
                name: data.productDetails.itemName,
                quantity: 1,
                unitPrice: 0,
                description: data.productDetails.itemDescription || ''
              });
            } else {
              items[0].name = data.productDetails.itemName;
              if (data.productDetails.itemDescription) {
                items[0].description = data.productDetails.itemDescription;
              }
            }
            
            await SalesOrder.update(salesOrderId, { items });
          }
        } catch (syncError) {
          console.error('[SalesOrderDetail] Failed to sync product name to Sales Order:', syncError);
        }
      }

      const updatedDetail = await SalesOrderDetail.findBySalesOrderId(salesOrderId);

      await SalesOrderStep.update(salesOrderId, 2, {
        status: 'in_progress',
        data: updatedDetail
      });

      res.json(formatSuccessResponse(updatedDetail, 'Root Card Details saved successfully'));
    } catch (error) {
      console.error('Error saving Root Card Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getSalesOrderDetail(req, res) {
    try {
      const { salesOrderId } = req.params;

      const detail = await SalesOrderDetail.findBySalesOrderId(salesOrderId);
      if (!detail) {
        return res.status(404).json(formatErrorResponse('Root Card Details not found'));
      }

      res.json(formatSuccessResponse(detail, 'Root Card Details retrieved successfully'));
    } catch (error) {
      console.error('Error getting Root Card Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateSalesAndProduct(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      console.log('[SalesOrderDetail] Sales & Product data received:');
      console.log('  productDetails type:', typeof data.productDetails);
      console.log('  productDetails value:', data.productDetails);

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

      // Sync product name to main Sales Order items if available
      if (data.productDetails && data.productDetails.itemName) {
        try {
          const salesOrder = await SalesOrder.findById(salesOrderId);
          if (salesOrder) {
            let items = [];
            try {
              items = typeof salesOrder.items === 'string' ? JSON.parse(salesOrder.items) : (salesOrder.items || []);
            } catch (e) {
              items = [];
            }
            
            if (items.length === 0) {
              items.push({
                name: data.productDetails.itemName,
                quantity: 1,
                unitPrice: 0,
                description: data.productDetails.itemDescription || ''
              });
            } else {
              items[0].name = data.productDetails.itemName;
              if (data.productDetails.itemDescription) {
                items[0].description = data.productDetails.itemDescription;
              }
            }
            
            await SalesOrder.update(salesOrderId, { items });
            console.log(`[SalesOrderDetail] Synced product name "${data.productDetails.itemName}" to Sales Order #${salesOrderId}`);
          }
        } catch (syncError) {
          console.error('[SalesOrderDetail] Failed to sync product name to Sales Order:', syncError);
        }
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

      console.log('[SalesOrderDetail] Quality & Compliance data received:');
      console.log('  qualityCompliance type:', typeof data.qualityCompliance);
      console.log('  qualityCompliance value:', data.qualityCompliance);
      console.log('  warrantySupport type:', typeof data.warrantySupport);
      console.log('  warrantySupport value:', data.warrantySupport);

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
        return res.status(404).json(formatErrorResponse('Root Card Details not found'));
      }

      await SalesOrderDetail.delete(salesOrderId);

      await SalesOrderStep.update(salesOrderId, 2, {
        status: 'pending',
        data: null
      });

      res.json(formatSuccessResponse(null, 'Root Card Details deleted successfully'));
    } catch (error) {
      console.error('Error deleting Root Card Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = SalesOrderDetailController;
