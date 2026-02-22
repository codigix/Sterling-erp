const path = require('path');
const fs = require('fs');
const TechnicalFile = require('../../models/TechnicalFile');

exports.getTechnicalFiles = async (req, res) => {
  try {
    const { search, category, rootCardId } = req.query;
    const technicalFiles = await TechnicalFile.findAll({ search, category, rootCardId });
    
    const formattedFiles = technicalFiles.map(f => ({
      id: f.id,
      name: f.name,
      category: f.category,
      description: f.description,
      fileName: f.file_name,
      filePath: f.file_path,
      type: path.extname(f.file_name).toLowerCase(),
      createdAt: f.created_at,
      date: new Date(f.created_at).toLocaleDateString(),
      uploadedBy: f.uploaded_by_name || 'Unknown',
      rootCardId: f.root_card_id,
      status: f.status || 'Draft'
    }));

    res.json(formattedFiles);
  } catch (error) {
    console.error('Get technical files error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.createTechnicalFile = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      description,
      rootCardId
    } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    if (!name) {
      return res.status(400).json({ message: 'File name is required' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const technicalFileId = await TechnicalFile.create({
      name,
      category,
      description: description || '',
      rootCardId,
      filePath: file.path,
      fileName: file.originalname,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      message: 'Technical file created successfully',
      technicalFileId
    });

  } catch (error) {
    console.error('Create technical file error:', error);
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

exports.downloadTechnicalFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const technicalFile = await TechnicalFile.findById(id);
    if (!technicalFile) {
      return res.status(404).json({ message: 'Technical file not found' });
    }

    const filePath = technicalFile.file_path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const fileName = technicalFile.file_name || `${technicalFile.name}`;
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Failed to download file', error: err.message });
        }
      }
    });
  } catch (error) {
    console.error('Download technical file error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deleteTechnicalFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const technicalFile = await TechnicalFile.findById(id);
    if (!technicalFile) {
      return res.status(404).json({ message: 'Technical file not found' });
    }

    const filePath = technicalFile.file_path;
    
    await TechnicalFile.delete(id);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }

    res.json({ message: 'Technical file deleted successfully' });
  } catch (error) {
    console.error('Delete technical file error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
