const Specification = require('../../models/Specification');
const path = require('path');
const fs = require('fs');

exports.getSpecifications = async (req, res) => {
  try {
    const { search, rootCardId } = req.query;
    const specifications = await Specification.findAll({ search, rootCardId });
    
    const formattedSpecs = specifications.map(s => ({
      id: s.id,
      rootCardId: s.root_card_id,
      title: s.title,
      description: s.description,
      version: s.version,
      fileName: s.file_name,
      filePath: s.file_path,
      createdAt: s.created_at,
      date: new Date(s.created_at).toLocaleDateString(),
      uploadedBy: s.uploaded_by_name || 'Unknown',
      status: s.status || 'Draft'
    }));

    res.json(formattedSpecs);
  } catch (error) {
    console.error('Get specifications error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.createSpecification = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      version,
      rootCardId
    } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const specificationId = await Specification.create({
      title,
      description: description || '',
      version: version || 'v1.0',
      rootCardId,
      filePath: file.path,
      fileName: file.originalname,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      message: 'Specification created successfully',
      specificationId
    });

  } catch (error) {
    console.error('Create specification error:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed to delete file after error:', e);
      }
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.downloadSpecification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const specification = await Specification.findById(id);
    if (!specification) {
      return res.status(404).json({ message: 'Specification not found' });
    }

    const filePath = specification.file_path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const fileName = specification.file_name || `${specification.title}.pdf`;
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Failed to download file', error: err.message });
        }
      }
    });
  } catch (error) {
    console.error('Download specification error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deleteSpecification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const specification = await Specification.findById(id);
    if (!specification) {
      return res.status(404).json({ message: 'Specification not found' });
    }

    const filePath = specification.file_path;
    
    await Specification.delete(id);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }

    res.json({ message: 'Specification deleted successfully' });
  } catch (error) {
    console.error('Delete specification error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateSpecification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, version, rootCardId } = req.body;
    const file = req.file;

    const specification = await Specification.findById(id);
    if (!specification) {
      return res.status(404).json({ message: 'Specification not found' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (version) updateData.version = version;
    if (rootCardId) updateData.rootCardId = rootCardId;

    if (file) {
      updateData.filePath = file.path;
      updateData.fileName = file.originalname;

      // Delete old file if it exists
      if (specification.file_path && fs.existsSync(specification.file_path)) {
        try {
          fs.unlinkSync(specification.file_path);
        } catch (err) {
          console.error('Failed to delete old file:', err);
        }
      }
    }

    await Specification.update(id, updateData);

    res.json({ message: 'Specification updated successfully' });
  } catch (error) {
    console.error('Update specification error:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed to delete file after error:', e);
      }
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.approveSpecification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const specification = await Specification.findById(id);
    if (!specification) {
      return res.status(404).json({ message: 'Specification not found' });
    }

    const updateData = {
      status: status || 'Approved'
    };
    if (notes !== undefined) {
      updateData.description = notes || specification.description;
    }

    await Specification.update(id, updateData);

    res.json({ message: 'Specification approved successfully' });
  } catch (error) {
    console.error('Approve specification error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
