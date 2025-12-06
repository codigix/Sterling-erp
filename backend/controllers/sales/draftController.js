const SalesOrderDraft = require('../../models/SalesOrderDraft');

exports.getLatestDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const draft = await SalesOrderDraft.findLatest(userId);
    res.json({ draft });
  } catch (error) {
    console.error('Get latest draft error:', error);
    res.status(500).json({ message: 'Failed to load draft' });
  }
};

exports.getDraftById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const draft = await SalesOrderDraft.findById(id, userId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    res.json({ draft });
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({ message: 'Failed to load draft' });
  }
};

exports.createDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { formData, currentStep, poDocuments } = req.body;
    const draftId = await SalesOrderDraft.create(userId, {
      formData,
      currentStep,
      poDocuments,
    });

    res.status(201).json({
      id: draftId,
      message: 'Draft created successfully',
    });
  } catch (error) {
    console.error('Create draft error:', error);
    res.status(500).json({ message: 'Failed to save draft' });
  }
};

exports.updateDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const draft = await SalesOrderDraft.findById(id, userId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    const { formData, currentStep, poDocuments } = req.body;
    await SalesOrderDraft.update(id, userId, {
      formData,
      currentStep,
      poDocuments,
    });

    res.json({ message: 'Draft updated successfully' });
  } catch (error) {
    console.error('Update draft error:', error);
    res.status(500).json({ message: 'Failed to update draft' });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const draft = await SalesOrderDraft.findById(id, userId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    await SalesOrderDraft.delete(id, userId);
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ message: 'Failed to delete draft' });
  }
};
