const Drawing = require('../../models/Drawing');
const RootCard = require('../../models/RootCard');
const path = require('path');
const fs = require('fs');

exports.getDrawings = async (req, res) => {
  try {
    const { search } = req.query;
    const drawings = await Drawing.findAll({ search });
    
    // Format for frontend
    const formattedDrawings = drawings.map(d => ({
      id: d.id,
      name: d.name,
      drawingNumber: d.drawing_number,
      type: d.type,
      format: d.format,
      size: d.size,
      date: new Date(d.created_at).toLocaleDateString(),
      status: d.status,
      designTitle: d.design_title,
      version: d.version,
      filePath: d.file_path
    }));

    res.json({ drawings: formattedDrawings });
  } catch (error) {
    console.error('Get drawings error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.uploadDrawing = async (req, res) => {
  try {
    const { 
      designName, 
      drawingName, 
      drawingNumber, 
      drawingType, 
      version, 
      drawingStatus, 
      remarks 
    } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    if (!designName) {
      return res.status(400).json({ message: 'Design Name is required' });
    }

    // Find RootCard by title (since frontend sends title)
    // Ideally frontend should send ID, but we support the current implementation
    const pool = require('../../config/database');
    const [rootCards] = await pool.execute(
      'SELECT id FROM root_cards WHERE title = ? LIMIT 1',
      [designName]
    );

    if (rootCards.length === 0) {
      return res.status(404).json({ message: 'Design (Root Card) not found' });
    }

    const rootCardId = rootCards[0].id;

    // Calculate file size string (e.g. "2.4 MB")
    const fileSizeInBytes = file.size;
    let sizeString = '';
    if (fileSizeInBytes < 1024) {
      sizeString = fileSizeInBytes + ' B';
    } else if (fileSizeInBytes < 1024 * 1024) {
      sizeString = (fileSizeInBytes / 1024).toFixed(1) + ' KB';
    } else {
      sizeString = (fileSizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Determine format from mimetype or extension
    const format = path.extname(file.originalname).substring(1).toUpperCase();

    const drawingId = await Drawing.create({
      rootCardId,
      name: drawingName,
      drawingNumber,
      type: drawingType,
      version,
      status: drawingStatus,
      remarks,
      filePath: file.path,
      format,
      size: sizeString,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      message: 'Drawing uploaded successfully',
      drawingId
    });

  } catch (error) {
    console.error('Upload drawing error:', error);
    // Clean up file if error
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
