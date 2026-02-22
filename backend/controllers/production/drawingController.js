const Drawing = require('../../models/Drawing');
const RootCard = require('../../models/RootCard');
const path = require('path');
const fs = require('fs');

exports.getDrawings = async (req, res) => {
  try {
    const { search, rootCardId } = req.query;
    const drawings = await Drawing.findAll({ search, rootCardId });
    
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
      filePath: d.file_path,
      rootCardId: d.root_card_id,
      createdAt: d.created_at
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
      remarks,
      rootCardId
    } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    let finalRootCardId = rootCardId;

    // If rootCardId is provided, use it directly
    if (!finalRootCardId && designName) {
      // Otherwise, try to find RootCard by title
      const pool = require('../../config/database');
      const [rootCards] = await pool.execute(
        'SELECT id FROM root_cards WHERE title = ? LIMIT 1',
        [designName]
      );

      if (rootCards.length === 0) {
        return res.status(404).json({ message: 'Design (Root Card) not found' });
      }

      finalRootCardId = rootCards[0].id;
    }

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
      rootCardId: finalRootCardId,
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

exports.downloadDrawing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const drawing = await Drawing.findById(id);
    if (!drawing) {
      return res.status(404).json({ message: 'Drawing not found' });
    }

    const filePath = drawing.file_path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const fileName = `${drawing.drawing_number || drawing.name}.${path.extname(filePath).substring(1)}`;
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Failed to download file', error: err.message });
        }
      }
    });
  } catch (error) {
    console.error('Download drawing error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deleteDrawing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const drawing = await Drawing.findById(id);
    if (!drawing) {
      return res.status(404).json({ message: 'Drawing not found' });
    }

    const filePath = drawing.file_path;
    
    await Drawing.delete(id);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }

    res.json({ message: 'Drawing deleted successfully' });
  } catch (error) {
    console.error('Delete drawing error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.approveDrawing = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const drawing = await Drawing.findById(id);
    if (!drawing) {
      return res.status(404).json({ message: 'Drawing not found' });
    }

    const pool = require('../../config/database');
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE drawings SET status = ?, remarks = ? WHERE id = ?',
        [status || 'Approved', notes || drawing.remarks, id]
      );
      res.json({ message: 'Drawing approved successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Approve drawing error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
