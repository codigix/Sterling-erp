const ClientPODetail = require('../../models/ClientPODetail');
const RootCardStep = require('../../models/RootCardStep');
const RootCard = require('../../models/RootCard');
const { validateClientPO } = require('../../utils/rootCardValidators');
const {
  formatSuccessResponse,
  formatErrorResponse
} = require('../../utils/rootCardHelpers');

class ClientPOController {
  static async createOrUpdate(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;

      console.log('[ClientPO] Received data:', JSON.stringify(data, null, 2));
      console.log('[ClientPO] projectRequirements type:', typeof data.projectRequirements);
      console.log('[ClientPO] projectRequirements:', data.projectRequirements);

      const validation = validateClientPO(data);
      if (!validation.isValid) {
        console.warn('Client PO validation warnings:', validation.errors);
      }

      const rootCard = await RootCard.findById(rootCardId);
      if (!rootCard) {
        return res.status(404).json(formatErrorResponse('Root Card not found'));
      }

      let poDetal = await ClientPODetail.findByRootCardId(rootCardId);

      if (poDetal) {
        await ClientPODetail.update(rootCardId, data);
      } else {
        data.rootCardId = rootCardId;
        await ClientPODetail.create(data);
      }

      // Sync product name to main Root Card items if available
      if (data.productDetails && data.productDetails.itemName) {
        try {
          const rootCard = await RootCard.findById(rootCardId);
          if (rootCard) {
            let items = [];
            try {
              items = typeof rootCard.items === 'string' ? JSON.parse(rootCard.items) : (rootCard.items || []);
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
            
            await RootCard.update(rootCardId, { items });
            console.log(`[ClientPO] Synced product name "${data.productDetails.itemName}" to Root Card #${rootCardId}`);
          }
        } catch (syncError) {
          console.error('[ClientPO] Failed to sync product name to Root Card:', syncError);
        }
      }

      const updatedPO = await ClientPODetail.findByRootCardId(rootCardId);

      await RootCardStep.update(rootCardId, 1, {
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
      const { rootCardId } = req.params;

      const poDetal = await ClientPODetail.findByRootCardId(rootCardId);
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
      const { rootCardId } = req.params;

      const poDetail = await ClientPODetail.findByRootCardId(rootCardId);
      if (!poDetail) {
        return res.status(404).json(formatErrorResponse('Client PO not found'));
      }

      await ClientPODetail.delete(rootCardId);

      await RootCardStep.update(rootCardId, 1, {
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
      const { rootCardId } = req.params;
      const data = req.body;

      const rootCard = await RootCard.findById(rootCardId);
      if (!rootCard) {
        return res.status(404).json(formatErrorResponse('Root Card not found'));
      }

      let poDetail = await ClientPODetail.findByRootCardId(rootCardId);

      if (!poDetail) {
        data.rootCardId = rootCardId;
        data.projectName = data.projectName || 'TBD';
        data.projectCode = data.projectCode || 'AUTO-GEN';
        await ClientPODetail.create(data);
      } else {
        await ClientPODetail.updateClientInfo(rootCardId, data);
      }

      const clientInfo = await ClientPODetail.getClientInfo(rootCardId);

      res.json(formatSuccessResponse(clientInfo, 'Client information saved successfully'));
    } catch (error) {
      console.error('Error saving Client Info:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getClientInfo(req, res) {
    try {
      const { rootCardId } = req.params;

      const clientInfo = await ClientPODetail.getClientInfo(rootCardId);
      res.json(formatSuccessResponse(clientInfo || null, 'Client information retrieved successfully'));
    } catch (error) {
      console.error('Error getting Client Info:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateProjectDetails(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;

      const rootCard = await RootCard.findById(rootCardId);
      if (!rootCard) {
        return res.status(404).json(formatErrorResponse('Root Card not found'));
      }

      let poDetail = await ClientPODetail.findByRootCardId(rootCardId);

      if (!poDetail) {
        data.rootCardId = rootCardId;
        data.clientName = data.clientName || 'TBD';
        data.clientEmail = data.clientEmail || 'TBD';
        data.clientPhone = data.clientPhone || 'TBD';
        data.poNumber = data.poNumber || 'TBD';
        data.poDate = data.poDate || new Date().toISOString().split('T')[0];
        await ClientPODetail.create(data);
      } else {
        await ClientPODetail.updateProjectDetails(rootCardId, data);
      }

      const projectDetails = await ClientPODetail.getProjectDetails(rootCardId);

      res.json(formatSuccessResponse(projectDetails, 'Project details saved successfully'));
    } catch (error) {
      console.error('Error saving Project Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getProjectDetails(req, res) {
    try {
      const { rootCardId } = req.params;

      const projectDetails = await ClientPODetail.getProjectDetails(rootCardId);
      res.json(formatSuccessResponse(projectDetails || null, 'Project details retrieved successfully'));
    } catch (error) {
      console.error('Error getting Project Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async deleteProjectDetails(req, res) {
    try {
      const { rootCardId } = req.params;

      const rootCard = await RootCard.findById(rootCardId);
      if (!rootCard) {
        return res.status(404).json(formatErrorResponse('Root Card not found'));
      }

      const projectDetails = await ClientPODetail.getProjectDetails(rootCardId);
      if (!projectDetails) {
        return res.status(404).json(formatErrorResponse('Project details not found'));
      }

      await ClientPODetail.deleteProjectDetails(rootCardId);

      res.json(formatSuccessResponse(null, 'Project details deleted successfully'));
    } catch (error) {
      console.error('Error deleting Project Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateProjectRequirements(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;

      const rootCard = await RootCard.findById(rootCardId);
      if (!rootCard) {
        return res.status(404).json(formatErrorResponse('Root Card not found'));
      }

      let poDetail = await ClientPODetail.findByRootCardId(rootCardId);

      if (!poDetail) {
        const initData = {
          rootCardId: rootCardId,
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
        await ClientPODetail.updateProjectRequirements(rootCardId, data);
      }

      const projectRequirements = await ClientPODetail.getProjectRequirements(rootCardId);

      res.json(formatSuccessResponse(projectRequirements, 'Project requirements saved successfully'));
    } catch (error) {
      console.error('Error saving Project Requirements:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getProjectRequirements(req, res) {
    try {
      const { rootCardId } = req.params;

      const projectRequirements = await ClientPODetail.getProjectRequirements(rootCardId);
      res.json(formatSuccessResponse(projectRequirements || null, 'Project requirements retrieved successfully'));
    } catch (error) {
      console.error('Error getting Project Requirements:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async createOrUpdateProductDetails(req, res) {
    try {
      const { rootCardId } = req.params;
      const data = req.body;

      console.log('[ClientPO] Product Details data received:', data);

      const rootCard = await RootCard.findById(rootCardId);
      if (!rootCard) {
        return res.status(404).json(formatErrorResponse('Root Card not found'));
      }

      let poDetail = await ClientPODetail.findByRootCardId(rootCardId);

      if (!poDetail) {
        const initData = {
          rootCardId: rootCardId,
          clientName: 'TBD',
          clientEmail: 'TBD',
          clientPhone: 'TBD',
          poNumber: 'TBD',
          poDate: new Date().toISOString().split('T')[0],
          projectName: 'TBD',
          projectCode: 'AUTO-GEN',
          productDetails: data
        };
        await ClientPODetail.create(initData);
      } else {
        await ClientPODetail.updateProductDetails(rootCardId, data);
      }

      // Sync product name to main Root Card items if available
      if (data && data.itemName) {
        try {
          const rootCard = await RootCard.findById(rootCardId);
          if (rootCard) {
            let items = [];
            try {
              items = typeof rootCard.items === 'string' ? JSON.parse(rootCard.items) : (rootCard.items || []);
            } catch (e) {
              items = [];
            }
            
            if (items.length === 0) {
              items.push({
                name: data.itemName,
                quantity: 1,
                unitPrice: 0,
                description: data.itemDescription || ''
              });
            } else {
              items[0].name = data.itemName;
              if (data.itemDescription) {
                items[0].description = data.itemDescription;
              }
            }
            
            await RootCard.update(rootCardId, { items });
            console.log(`[ClientPO] Synced product name "${data.itemName}" to Root Card #${rootCardId}`);
          }
        } catch (syncError) {
          console.error('[ClientPO] Failed to sync product name to Root Card:', syncError);
        }
      }

      const productDetails = await ClientPODetail.getProductDetails(rootCardId);

      res.json(formatSuccessResponse(productDetails, 'Product details saved successfully'));
    } catch (error) {
      console.error('Error saving Product Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getProductDetails(req, res) {
    try {
      const { rootCardId } = req.params;

      const productDetails = await ClientPODetail.getProductDetails(rootCardId);
      res.json(formatSuccessResponse(productDetails || null, 'Product details retrieved successfully'));
    } catch (error) {
      console.error('Error getting Product Details:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = ClientPOController;
