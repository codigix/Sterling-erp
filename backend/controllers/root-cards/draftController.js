const RootCardDraft = require('../../models/RootCardDraft');

exports.getLatestDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const draft = await RootCardDraft.findLatest(userId);
    res.json({ draft });
  } catch (error) {
    console.error('Get latest draft error:', error);
    res.status(500).json({ message: 'Failed to load root card draft' });
  }
};

exports.getDraftById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const draft = await RootCardDraft.findById(id, userId);
    if (!draft) {
      return res.status(404).json({ message: 'Root card draft not found' });
    }

    res.json({ draft });
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({ message: 'Failed to load root card draft' });
  }
};

exports.createDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { formData, currentStep, poDocuments } = req.body;
    const draftId = await RootCardDraft.create(userId, {
      formData,
      currentStep,
      poDocuments,
    });

    res.status(201).json({
      id: draftId,
      message: 'Root card draft created successfully',
    });
  } catch (error) {
    console.error('Create draft error:', error);
    res.status(500).json({ message: 'Failed to save root card draft' });
  }
};

exports.updateDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const draft = await RootCardDraft.findById(id, userId);
    if (!draft) {
      return res.status(404).json({ message: 'Root card draft not found' });
    }

    const { formData, currentStep, poDocuments } = req.body;
    await RootCardDraft.update(id, userId, {
      formData,
      currentStep,
      poDocuments,
    });

    res.json({ message: 'Root card draft updated successfully' });
  } catch (error) {
    console.error('Update draft error:', error);
    res.status(500).json({ message: 'Failed to update root card draft' });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const draft = await RootCardDraft.findById(id, userId);
    if (!draft) {
      return res.status(404).json({ message: 'Root card draft not found' });
    }

    await RootCardDraft.delete(id, userId);
    res.json({ message: 'Root card draft deleted successfully' });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ message: 'Failed to delete root card draft' });
  }
};
