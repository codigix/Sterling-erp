const pool = require('../../config/database');
const Drawing = require('../../models/Drawing');
const Specification = require('../../models/Specification');
const RootCard = require('../../models/RootCard');

class DesignEngineerDocumentsController {
  static async getAssignedRootCards(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          status: 'error',
          message: 'User ID is required' 
        });
      }

      const [rootCards] = await pool.execute(`
        SELECT so.id, so.po_number, so.project_name, so.customer, so.order_date, so.due_date, so.status, so.priority, so.created_at
        FROM sales_orders so
        ORDER BY so.created_at DESC
        LIMIT 100
      `);

      console.log(`[getAssignedRootCards] Found ${rootCards.length} total root cards`);

      res.json({
        status: 'success',
        data: rootCards,
        message: 'Root cards retrieved'
      });
    } catch (error) {
      console.error('Error fetching root cards:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch root cards',
        error: error.message
      });
    }
  }

  static async getRawDesigns(req, res) {
    try {
      const { rootCardId } = req.params;
      const userId = req.user?.id;

      if (!rootCardId) {
        return res.status(400).json({
          status: 'error',
          message: 'Root Card ID is required'
        });
      }

      const rootCard = await RootCard.findById(rootCardId);
      if (!rootCard) {
        return res.status(404).json({
          status: 'error',
          message: 'Root Card not found'
        });
      }

      const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
      const drawings = await DesignEngineeringDetail.getDrawings(rootCardId);

      console.log(`[getRawDesigns] Root Card ${rootCardId}: Found ${drawings.length} drawings from design_engineering_details`);
      if (drawings.length > 0) {
        console.log(`[getRawDesigns] Sample drawing returned:`, JSON.stringify(drawings[0], null, 2));
      }

      res.json({
        status: 'success',
        data: {
          rootCard: {
            id: rootCard.id,
            poNumber: rootCard.po_number,
            projectName: rootCard.project_name,
            customer: rootCard.customer
          },
          drawings: drawings || [],
          count: drawings ? drawings.length : 0
        },
        message: 'Raw design drawings retrieved'
      });
    } catch (error) {
      console.error('Error fetching raw designs:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch raw designs',
        error: error.message
      });
    }
  }

  static async getRequiredDocuments(req, res) {
    try {
      const { rootCardId } = req.params;
      const userId = req.user?.id;

      console.log(`[getRequiredDocuments] Request received for rootCardId: ${rootCardId}`);

      if (!rootCardId) {
        return res.status(400).json({
          status: 'error',
          message: 'Root Card ID is required'
        });
      }

      const rootCard = await RootCard.findById(rootCardId);
      if (!rootCard) {
        console.warn(`[getRequiredDocuments] Root Card not found: ${rootCardId}`);
        return res.status(404).json({
          status: 'error',
          message: 'Root Card not found'
        });
      }

      console.log(`[getRequiredDocuments] Root Card found:`, rootCard.po_number);

      const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
      const documents = await DesignEngineeringDetail.getDocuments(rootCardId);

      // Also check if there are documents directly on the root card (sales order)
      let rootCardDocs = [];
      if (rootCard.documents && Array.isArray(rootCard.documents)) {
        console.log(`[getRequiredDocuments] Found ${rootCard.documents.length} documents on base root card`);
        rootCardDocs = rootCard.documents.map((doc, idx) => {
          const { enrichDocumentWithPath } = require('../../utils/filePathRecovery');
          const enriched = enrichDocumentWithPath(doc, 'client-po');
          return {
            ...enriched,
            id: enriched.id || `rc-${rootCardId}-${idx}`,
            name: enriched.name || enriched.fileName || 'Root Card Document',
            status: enriched.status || 'available',
            uploadedAt: enriched.uploadedAt || rootCard.created_at,
            source: 'root-card'
          };
        });
      }

      const combinedDocuments = [...documents, ...rootCardDocs];

      console.log(`[getRequiredDocuments] Root Card ${rootCardId}: Total ${combinedDocuments.length} documents (${documents.length} design, ${rootCardDocs.length} root)`);
      
      res.json({
        status: 'success',
        data: {
          rootCard: {
            id: rootCard.id,
            poNumber: rootCard.po_number,
            projectName: rootCard.project_name,
            customer: rootCard.customer
          },
          documents: combinedDocuments,
          count: combinedDocuments.length
        },
        message: 'Required documents retrieved'
      });
    } catch (error) {
      console.error('Error fetching required documents:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch required documents',
        error: error.message
      });
    }
  }

  static async getDrawingDetails(req, res) {
    try {
      const { drawingId } = req.params;

      if (!drawingId) {
        return res.status(400).json({
          status: 'error',
          message: 'Drawing ID is required'
        });
      }

      const drawing = await Drawing.findById(drawingId);
      if (!drawing) {
        return res.status(404).json({
          status: 'error',
          message: 'Drawing not found'
        });
      }

      res.json({
        status: 'success',
        data: drawing,
        message: 'Drawing details retrieved'
      });
    } catch (error) {
      console.error('Error fetching drawing details:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch drawing details',
        error: error.message
      });
    }
  }

  static async getDocumentDetails(req, res) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        return res.status(400).json({
          status: 'error',
          message: 'Document ID is required'
        });
      }

      const specification = await Specification.findById(documentId);
      if (!specification) {
        return res.status(404).json({
          status: 'error',
          message: 'Document not found'
        });
      }

      res.json({
        status: 'success',
        data: specification,
        message: 'Document details retrieved'
      });
    } catch (error) {
      console.error('Error fetching document details:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch document details',
        error: error.message
      });
    }
  }
}

module.exports = DesignEngineerDocumentsController;
