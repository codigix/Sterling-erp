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
      const { assignedTo } = req.body;

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

      // Sync basic fields to main Root Card table
      try {
        const rootCard = await RootCard.findById(rootCardId);
        if (rootCard) {
          const syncData = {};
          if (data.clientName) syncData.customer = data.clientName;
          if (data.poNumber) syncData.poNumber = data.poNumber;
          if (data.projectName) syncData.projectName = data.projectName;
          if (data.poDate) syncData.orderDate = data.poDate;
          if (data.estimatedEndDate) syncData.dueDate = data.estimatedEndDate;

          // Sync product name to main Root Card items if available
          if (data.productDetails && data.productDetails.itemName) {
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
            syncData.items = items;
          }

          if (Object.keys(syncData).length > 0) {
            await RootCard.update(rootCardId, syncData);
            console.log(`[ClientPO] Synced fields to Root Card #${rootCardId}:`, Object.keys(syncData));
          }
        }
      } catch (syncError) {
        console.error('[ClientPO] Failed to sync fields to Root Card:', syncError);
      }

      const updatedPO = await ClientPODetail.findByRootCardId(rootCardId);

      await RootCardStep.update(rootCardId, 1, {
        status: 'in_progress',
        data: updatedPO,
        assignedTo
      });

      if (assignedTo) {
        await RootCardStep.assignEmployee(rootCardId, 1, assignedTo);
        // Task creation removed as per user request to keep them only in workflow tasks
      }

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
            
            await RootCard.update(rootCardId, { 
              items,
              projectName: rootCard.project_name || data.itemName 
            });
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

  static async uploadPODocuments(req, res) {
    try {
      const { rootCardId } = req.params;
      const files = req.files || [];
      const userId = req.user?.id || req.user?.userId;

      if (!files || files.length === 0) {
        return res.status(400).json(formatErrorResponse('No files uploaded'));
      }

      const rootCard = await RootCard.findById(rootCardId);
      
      let isDraft = false;
      if (!rootCard) {
        const RootCardDraft = require('../../models/RootCardDraft');
        const draft = await RootCardDraft.findById(rootCardId, userId);
        if (draft) {
          isDraft = true;
          console.log(`[ClientPOController] Root Card ${rootCardId} handled as draft upload.`);
        } else {
          return res.status(404).json(formatErrorResponse('Root Card not found'));
        }
      }

      const uploadedDocs = [];
      for (const file of files) {
        uploadedDocs.push({
          id: Date.now() + Math.random(),
          name: file.originalname,
          path: file.path,
          size: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date().toISOString(),
          uploadedBy: userId
        });
      }

      // If not a draft, we should ideally also update the database record
      // But for Client PO, the attachments are usually stored as a JSON array in client_po_details
      if (!isDraft) {
        let poDetail = await ClientPODetail.findByRootCardId(rootCardId);
        if (!poDetail) {
          // Create minimal record if it doesn't exist
          await ClientPODetail.create({
            rootCardId: rootCardId,
            poNumber: `TEMP-${Date.now()}`,
            poDate: new Date().toISOString().split('T')[0],
            clientName: 'TBD',
            clientEmail: 'TBD',
            clientPhone: 'TBD',
            projectName: 'TBD',
            projectCode: 'TBD',
            attachments: uploadedDocs
          });
        } else {
          const currentAttachments = Array.isArray(poDetail.attachments) ? poDetail.attachments : [];
          await ClientPODetail.update(rootCardId, {
            ...poDetail,
            attachments: [...currentAttachments, ...uploadedDocs]
          });
        }
      }

      res.json(formatSuccessResponse({
        uploaded: uploadedDocs
      }, `${uploadedDocs.length} document(s) uploaded successfully${isDraft ? ' (Draft)' : ''}`));
    } catch (error) {
      console.error('Error uploading PO documents:', error);
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

  static async validatePO(req, res) {
    try {
      const { rootCardId } = req.params;

      const detail = await ClientPODetail.findByRootCardId(rootCardId);
      
      const errors = [];
      const warnings = [];

      if (!detail) {
        return res.json(formatSuccessResponse({
          isValid: true,
          errors: [],
          warnings: ['Client PO data not yet initialized'],
          poData: null
        }, 'PO validation completed (no data)'));
      }

      const validation = validateClientPO(detail);
      
      res.json(formatSuccessResponse({
        isValid: validation.isValid,
        errors: validation.errors || [],
        warnings,
        poData: detail
      }, 'PO validation completed'));
    } catch (error) {
      console.error('Error validating PO:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = ClientPOController;
