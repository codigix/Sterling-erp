const pool = require('../../config/database');
const EngineeringDocument = require('../../models/EngineeringDocument');
const RootCard = require('../../models/RootCard');

exports.uploadDocument = async (req, res) => {
  try {
    const { rootCardId, documentType, documentName } = req.body;
    const filePath = req.file?.path || null;
    const userId = req.user?.id;

    if (!rootCardId || !documentType || !filePath) {
      return res.status(400).json({ message: 'Root Card ID, Document Type, and File are required' });
    }

    const rootCard = await RootCard.findById(rootCardId);
    if (!rootCard) {
      return res.status(404).json({ message: 'Root Card not found' });
    }

    const docId = await EngineeringDocument.create({
      rootCardId,
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
    const { rootCardId } = req.query;

    if (!rootCardId) {
      return res.status(400).json({ message: 'Root Card ID is required' });
    }

    const documents = await EngineeringDocument.findByRootCardId(rootCardId);
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
