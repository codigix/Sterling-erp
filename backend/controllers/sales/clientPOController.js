const ClientPODetail = require('../../models/ClientPODetail');
const SalesOrderStep = require('../../models/SalesOrderStep');
const SalesOrder = require('../../models/SalesOrder');
const { validateClientPO } = require('../../utils/salesOrderValidators');
const {
  formatSuccessResponse,
  formatErrorResponse
} = require('../../utils/salesOrderHelpers');

class ClientPOController {
  static async createOrUpdate(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const validation = validateClientPO(data);
      if (!validation.isValid) {
        console.warn('Client PO validation warnings:', validation.errors);
      }

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      let poDetal = await ClientPODetail.findBySalesOrderId(salesOrderId);

      if (poDetal) {
        await ClientPODetail.update(salesOrderId, data);
      } else {
        data.salesOrderId = salesOrderId;
        await ClientPODetail.create(data);
      }

      const updatedPO = await ClientPODetail.findBySalesOrderId(salesOrderId);

      await SalesOrderStep.update(salesOrderId, 1, {
        status: 'in_progress',
        data: updatedPO
      });

      res.json(formatSuccessResponse(updatedPO, 'Client PO information saved successfully'));
    } catch (error) {
      console.error('Error saving Client PO:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getClientPO(req, res) {
    try {
      const { salesOrderId } = req.params;

      const poDetal = await ClientPODetail.findBySalesOrderId(salesOrderId);
      res.json(formatSuccessResponse(poDetal || null, 'Client PO retrieved successfully'));
    } catch (error) {
      console.error('Error getting Client PO:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async verifyPONumber(req, res) {
    try {
      const { poNumber } = req.params;

      const existing = await ClientPODetail.findByPONumber(poNumber);
      
      res.json(formatSuccessResponse({
        poNumber,
        exists: !!existing
      }, 'PO verification completed'));
    } catch (error) {
      console.error('Error verifying PO number:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getAll(req, res) {
    try {
      const { poNumber } = req.query;

      const filters = {};
      if (poNumber) {
        filters.poNumber = poNumber;
      }

      const poDetails = await ClientPODetail.getAll(filters);

      res.json(formatSuccessResponse({
        count: poDetails.length,
        poDetails
      }, 'All Client POs retrieved successfully'));
    } catch (error) {
      console.error('Error getting all Client POs:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async delete(req, res) {
    try {
      const { salesOrderId } = req.params;

      const poDetail = await ClientPODetail.findBySalesOrderId(salesOrderId);
      if (!poDetail) {
        return res.status(404).json(formatErrorResponse('Client PO not found'));
      }

      await ClientPODetail.delete(salesOrderId);

      await SalesOrderStep.update(salesOrderId, 1, {
        status: 'pending',
        data: null
      });

      res.json(formatSuccessResponse(null, 'Client PO deleted successfully'));
    } catch (error) {
      console.error('Error deleting Client PO:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateClientInfo(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      let poDetail = await ClientPODetail.findBySalesOrderId(salesOrderId);

      if (!poDetail) {
        data.salesOrderId = salesOrderId;
        data.projectName = data.projectName || 'TBD';
        data.projectCode = data.projectCode || 'AUTO-GEN';
        await ClientPODetail.create(data);
      } else {
        await ClientPODetail.updateClientInfo(salesOrderId, data);
      }

      const clientInfo = await ClientPODetail.getClientInfo(salesOrderId);

      res.json(formatSuccessResponse(clientInfo, 'Client information saved successfully'));
    } catch (error) {
      console.error('Error saving Client Info:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getClientInfo(req, res) {
    try {
      const { salesOrderId } = req.params;

      const clientInfo = await ClientPODetail.getClientInfo(salesOrderId);
      res.json(formatSuccessResponse(clientInfo || null, 'Client information retrieved successfully'));
    } catch (error) {
      console.error('Error getting Client Info:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateProjectDetails(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      let poDetail = await ClientPODetail.findBySalesOrderId(salesOrderId);

      if (!poDetail) {
        data.salesOrderId = salesOrderId;
        data.clientName = data.clientName || 'TBD';
        data.clientEmail = data.clientEmail || 'TBD';
        data.clientPhone = data.clientPhone || 'TBD';
        data.poNumber = data.poNumber || 'TBD';
        data.poDate = data.poDate || new Date().toISOString().split('T')[0];
        await ClientPODetail.create(data);
      } else {
        await ClientPODetail.updateProjectDetails(salesOrderId, data);
      }

      const projectDetails = await ClientPODetail.getProjectDetails(salesOrderId);

      res.json(formatSuccessResponse(projectDetails, 'Project details saved successfully'));
    } catch (error) {
      console.error('Error saving Project Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getProjectDetails(req, res) {
    try {
      const { salesOrderId } = req.params;

      const projectDetails = await ClientPODetail.getProjectDetails(salesOrderId);
      res.json(formatSuccessResponse(projectDetails || null, 'Project details retrieved successfully'));
    } catch (error) {
      console.error('Error getting Project Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async deleteProjectDetails(req, res) {
    try {
      const { salesOrderId } = req.params;

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      const projectDetails = await ClientPODetail.getProjectDetails(salesOrderId);
      if (!projectDetails) {
        return res.status(404).json(formatErrorResponse('Project details not found'));
      }

      await ClientPODetail.deleteProjectDetails(salesOrderId);

      res.json(formatSuccessResponse(null, 'Project details deleted successfully'));
    } catch (error) {
      console.error('Error deleting Project Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateProjectRequirements(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      let poDetail = await ClientPODetail.findBySalesOrderId(salesOrderId);

      if (!poDetail) {
        const initData = {
          salesOrderId: salesOrderId,
          clientName: 'TBD',
          clientEmail: 'TBD',
          clientPhone: 'TBD',
          poNumber: 'TBD',
          poDate: new Date().toISOString().split('T')[0],
          projectName: 'TBD',
          projectCode: 'AUTO-GEN',
          projectRequirements: data
        };
        await ClientPODetail.create(initData);
      } else {
        await ClientPODetail.updateProjectRequirements(salesOrderId, data);
      }

      const projectRequirements = await ClientPODetail.getProjectRequirements(salesOrderId);

      res.json(formatSuccessResponse(projectRequirements, 'Project requirements saved successfully'));
    } catch (error) {
      console.error('Error saving Project Requirements:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getProjectRequirements(req, res) {
    try {
      const { salesOrderId } = req.params;

      const projectRequirements = await ClientPODetail.getProjectRequirements(salesOrderId);
      res.json(formatSuccessResponse(projectRequirements || null, 'Project requirements retrieved successfully'));
    } catch (error) {
      console.error('Error getting Project Requirements:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = ClientPOController;
