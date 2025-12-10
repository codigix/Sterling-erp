const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
const SalesOrderStep = require('../../models/SalesOrderStep');
const { validateDesignEngineering } = require('../../utils/salesOrderValidators');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/salesOrderHelpers');

class DesignEngineeringController {
  static async createOrUpdate(req, res) {
    try {
      const { salesOrderId } = req.params;
      const data = req.body;

      const SalesOrder = require('../../models/SalesOrder');
      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json(formatErrorResponse('Sales Order not found'));
      }

      const validation = validateDesignEngineering(data);
      if (!validation.isValid) {
        console.warn('Design Engineering validation warnings:', validation.errors);
      }

      let designDetail = await DesignEngineeringDetail.findBySalesOrderId(salesOrderId);

      if (designDetail) {
        await DesignEngineeringDetail.update(salesOrderId, data);
      } else {
        data.salesOrderId = salesOrderId;
        await DesignEngineeringDetail.create(data);
      }

      const updated = await DesignEngineeringDetail.findBySalesOrderId(salesOrderId);
      await SalesOrderStep.update(salesOrderId, 3, { status: 'in_progress', data: updated });

      res.json(formatSuccessResponse(updated, 'Design Engineering data saved'));
    } catch (error) {
      console.error('Error saving Design Engineering:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getDesignEngineering(req, res) {
    try {
      const { salesOrderId } = req.params;
      const design = await DesignEngineeringDetail.findBySalesOrderId(salesOrderId);
      res.json(formatSuccessResponse(design || null, 'Design retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async approveDesign(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { reviewedBy, comments } = req.body;

      if (!reviewedBy) {
        return res.status(400).json(formatErrorResponse('Reviewer ID is required'));
      }

      await DesignEngineeringDetail.approveDesign(salesOrderId, reviewedBy, comments);
      await SalesOrderStep.update(salesOrderId, 3, { status: 'approved' });

      const updated = await DesignEngineeringDetail.findBySalesOrderId(salesOrderId);
      res.json(formatSuccessResponse(updated, 'Design approved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async rejectDesign(req, res) {
    try {
      const { salesOrderId } = req.params;
      const { reviewedBy, comments } = req.body;

      if (!reviewedBy) {
        return res.status(400).json(formatErrorResponse('Reviewer ID is required'));
      }

      await DesignEngineeringDetail.rejectDesign(salesOrderId, reviewedBy, comments);
      await SalesOrderStep.update(salesOrderId, 3, { status: 'rejected' });

      const updated = await DesignEngineeringDetail.findBySalesOrderId(salesOrderId);
      res.json(formatSuccessResponse(updated, 'Design rejected'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async uploadDesignDocuments(req, res) {
    try {
      const { salesOrderId } = req.params;
      const files = req.files || [];
      const userId = req.user?.id || req.user?.userId;

      if (!files || files.length === 0) {
        return res.status(400).json(formatErrorResponse('No files uploaded'));
      }

      const design = await DesignEngineeringDetail.findBySalesOrderId(salesOrderId);
      if (!design) {
        return res.status(404).json(formatErrorResponse('Design engineering details not found. Create design first.'));
      }

      const uploadedDocs = [];
      for (const file of files) {
        const doc = await DesignEngineeringDetail.addDocument(salesOrderId, {
          name: file.originalname,
          path: file.path,
          size: file.size,
          mimeType: file.mimetype,
          uploadedBy: userId
        });
        uploadedDocs.push(doc);
      }

      const updated = await DesignEngineeringDetail.findBySalesOrderId(salesOrderId);
      res.json(formatSuccessResponse({
        uploaded: uploadedDocs,
        design: updated
      }, `${uploadedDocs.length} document(s) uploaded successfully`));
    } catch (error) {
      console.error('Error uploading design documents:', error);
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getDesignDocuments(req, res) {
    try {
      const { salesOrderId } = req.params;

      const documents = await DesignEngineeringDetail.getDocuments(salesOrderId);
      res.json(formatSuccessResponse(documents, 'Design documents retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getDesignDocument(req, res) {
    try {
      const { salesOrderId, documentId } = req.params;

      const document = await DesignEngineeringDetail.getDocument(salesOrderId, documentId);
      if (!document) {
        return res.status(404).json(formatErrorResponse('Document not found'));
      }

      res.json(formatSuccessResponse(document, 'Design document retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async validateDesign(req, res) {
    try {
      const { salesOrderId } = req.params;

      const design = await DesignEngineeringDetail.findBySalesOrderId(salesOrderId);
      if (!design) {
        return res.status(404).json(formatErrorResponse('Design not found'));
      }

      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        status: design.designStatus
      };

      if (!design.documents || design.documents.length === 0) {
        validationResult.errors.push('No design documents uploaded');
        validationResult.isValid = false;
      }

      if (!design.designNotes || design.designNotes.trim() === '') {
        validationResult.warnings.push('Design notes are empty');
      }

      if (!design.specifications || design.specifications === null) {
        validationResult.warnings.push('Design specifications not defined');
      }

      if (!design.bomData || design.bomData === null) {
        validationResult.warnings.push('BOM data not attached to design');
      }

      res.json(formatSuccessResponse(validationResult, 'Design validation completed'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }

  static async getReviewHistory(req, res) {
    try {
      const { salesOrderId } = req.params;

      const history = await DesignEngineeringDetail.getApprovalHistory(salesOrderId);
      if (history.length === 0) {
        return res.status(404).json(formatErrorResponse('No review history found'));
      }

      res.json(formatSuccessResponse(history, 'Design review history retrieved'));
    } catch (error) {
      res.status(500).json(formatErrorResponse(error.message));
    }
  }
}

module.exports = DesignEngineeringController;
