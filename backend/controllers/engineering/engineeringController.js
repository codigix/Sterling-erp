const pool = require('../../config/database');
const EngineeringDocument = require('../../models/EngineeringDocument');
const BillOfMaterials = require('../../models/BillOfMaterials');
const SalesOrder = require('../../models/SalesOrder');

exports.uploadDocument = async (req, res) => {
  try {
    const { salesOrderId, documentType, documentName } = req.body;
    const filePath = req.file?.path || null;
    const userId = req.user?.id;

    if (!salesOrderId || !documentType || !filePath) {
      return res.status(400).json({ message: 'Sales Order ID, Document Type, and File are required' });
    }

    const salesOrder = await SalesOrder.findById(salesOrderId);
    if (!salesOrder) {
      return res.status(404).json({ message: 'Sales Order not found' });
    }

    const docId = await EngineeringDocument.create({
      salesOrderId,
      documentType,
      documentName: documentName || req.file.originalname,
      filePath,
      uploadedBy: userId
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      documentId: docId
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { salesOrderId } = req.query;

    if (!salesOrderId) {
      return res.status(400).json({ message: 'Sales Order ID is required' });
    }

    const documents = await EngineeringDocument.findBySalesOrderId(salesOrderId);
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
};

exports.approveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvalComments } = req.body;
    const userId = req.user?.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }

    await EngineeringDocument.updateStatus(id, `pending_${status}`, approvalComments, userId);

    res.json({ message: `Document ${status} successfully` });
  } catch (error) {
    console.error('Approve document error:', error);
    res.status(500).json({ message: 'Failed to approve document', error: error.message });
  }
};

exports.generateBOM = async (req, res) => {
  try {
    const { salesOrderId, bomName, lineItems } = req.body;
    const userId = req.user?.id;

    if (!salesOrderId || !bomName || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ message: 'Sales Order ID, BOM Name, and Line Items are required' });
    }

    const salesOrder = await SalesOrder.findById(salesOrderId);
    if (!salesOrder) {
      return res.status(404).json({ message: 'Sales Order not found' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const bomId = await BillOfMaterials.create({
        salesOrderId,
        bomName,
        description: req.body.description || null,
        createdBy: userId
      }, connection);

      for (const item of lineItems) {
        await BillOfMaterials.addLineItem(bomId, item, connection);
      }

      await connection.commit();

      res.status(201).json({
        message: 'BOM created successfully',
        bomId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Generate BOM error:', error);
    res.status(500).json({ message: 'Failed to generate BOM', error: error.message });
  }
};

exports.getBOMDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const bom = await BillOfMaterials.findById(id);
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    const lineItems = await BillOfMaterials.getLineItems(id);

    res.json({
      bom,
      lineItems
    });
  } catch (error) {
    console.error('Get BOM details error:', error);
    res.status(500).json({ message: 'Failed to fetch BOM', error: error.message });
  }
};

exports.getSalesOrderBOMs = async (req, res) => {
  try {
    const { salesOrderId } = req.query;

    if (!salesOrderId) {
      return res.status(400).json({ message: 'Sales Order ID is required' });
    }

    const boms = await BillOfMaterials.findBySalesOrderId(salesOrderId);
    res.json(boms);
  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({ message: 'Failed to fetch BOMs', error: error.message });
  }
};

exports.updateBOMStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'finalized', 'sent_to_procurement', 'sent_to_production'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid BOM status' });
    }

    await BillOfMaterials.updateStatus(id, status);

    res.json({ message: 'BOM status updated successfully' });
  } catch (error) {
    console.error('Update BOM status error:', error);
    res.status(500).json({ message: 'Failed to update BOM', error: error.message });
  }
};
