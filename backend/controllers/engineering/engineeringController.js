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
  let connection = null;
  try {
    const { salesOrderId, bomName, description, lineItems } = req.body;
    const userId = req.user?.id;

    console.log('GenerateBOM Request:', { userId, salesOrderId, bomName, lineItemsCount: lineItems?.length });

    if (!bomName || !bomName.trim()) {
      return res.status(400).json({ message: 'BOM Name is required' });
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ message: 'At least one line item is required' });
    }

    if (salesOrderId) {
      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json({ message: 'Sales Order not found' });
      }
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const bomId = await BillOfMaterials.create({
      salesOrderId: salesOrderId || null,
      bomName: bomName.trim(),
      description: description || null,
      createdBy: userId
    }, connection);

    console.log('BOM created with ID:', bomId);

    for (const item of lineItems) {
      if (!item.itemCode || !item.itemDescription || !item.quantity) {
        throw new Error('Each line item must have itemCode, itemDescription, and quantity');
      }
      await BillOfMaterials.addLineItem(bomId, item, connection);
    }

    await connection.commit();

    res.status(201).json({
      message: 'BOM created successfully',
      bomId,
      itemCount: lineItems.length
    });
  } catch (error) {
    console.error('Generate BOM error:', error.message);
    console.error('Error stack:', error.stack);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError.message);
      }
    }
    res.status(500).json({ 
      message: 'Failed to generate BOM', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
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

    if (salesOrderId) {
      const boms = await BillOfMaterials.findBySalesOrderId(salesOrderId);
      return res.json(boms || []);
    }

    res.json([]);
  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({ message: 'Failed to fetch BOMs', error: error.message });
  }
};

exports.updateBOMStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'pending_approval', 'approved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid BOM status. Valid statuses are: draft, pending_approval, approved' });
    }

    const bom = await BillOfMaterials.findById(id);
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    await BillOfMaterials.updateStatus(id, status);

    res.json({ message: 'BOM status updated successfully', status });
  } catch (error) {
    console.error('Update BOM status error:', error);
    res.status(500).json({ message: 'Failed to update BOM', error: error.message });
  }
};

exports.deleteBOM = async (req, res) => {
  try {
    const { id } = req.params;

    const bom = await BillOfMaterials.findById(id);
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    await BillOfMaterials.delete(id);

    res.json({ message: 'BOM deleted successfully' });
  } catch (error) {
    console.error('Delete BOM error:', error);
    res.status(500).json({ message: 'Failed to delete BOM', error: error.message });
  }
};

exports.getAllBOMs = async (req, res) => {
  try {
    const boms = await BillOfMaterials.getAll();
    res.json(boms || []);
  } catch (error) {
    console.error('Get all BOMs error:', error);
    res.status(500).json({ message: 'Failed to fetch BOMs', error: error.message });
  }
};

exports.updateLineItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const itemData = req.body;

    const bom = await BillOfMaterials.findById(id);
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    await BillOfMaterials.updateLineItem(itemId, itemData);

    res.json({ message: 'Line item updated successfully' });
  } catch (error) {
    console.error('Update line item error:', error);
    res.status(500).json({ message: 'Failed to update line item', error: error.message });
  }
};

exports.deleteLineItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const bom = await BillOfMaterials.findById(id);
    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    await BillOfMaterials.deleteLineItem(itemId);

    res.json({ message: 'Line item deleted successfully' });
  } catch (error) {
    console.error('Delete line item error:', error);
    res.status(500).json({ message: 'Failed to delete line item', error: error.message });
  }
};
