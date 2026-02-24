const fs = require('fs');
const path = require('path');

class FileDownloadController {
  static async downloadFile(req, res) {
    try {
      const { path: filePath, name } = req.query;

      console.log(`[fileDownloadController.downloadFile] Request received`);
      console.log(`[fileDownloadController.downloadFile] Query params:`, { filePath, name });

      if (!filePath) {
        console.warn(`[fileDownloadController.downloadFile] No file path provided`);
        return res.status(400).json({
          status: 'error',
          message: 'File path is required'
        });
      }

      const decodedPath = decodeURIComponent(filePath);
      console.log(`[fileDownloadController.downloadFile] Decoded path:`, decodedPath);
      
      const fullPath = path.join(__dirname, '../../', decodedPath);
      console.log(`[fileDownloadController.downloadFile] Full path:`, fullPath);
      console.log(`[fileDownloadController.downloadFile] File exists:`, fs.existsSync(fullPath));
      
      if (!fs.existsSync(fullPath)) {
        console.error(`[fileDownloadController.downloadFile] File not found at: ${fullPath}`);
        return res.status(404).json({
          status: 'error',
          message: 'File not found'
        });
      }

      const fileName = name ? decodeURIComponent(name) : path.basename(fullPath);
      const extension = path.extname(fileName).toLowerCase();

      // Set correct MIME type
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.dwg': 'application/x-dwg',
        '.dxf': 'application/x-dxf',
        '.step': 'application/step',
        '.stp': 'application/step'
      };

      const contentType = mimeTypes[extension] || 'application/octet-stream';

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', contentType);
      
      const fileStream = fs.createReadStream(fullPath);
      fileStream.on('error', (err) => {
        console.error('Error streaming file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            status: 'error',
            message: 'Error downloading file'
          });
        }
      });

      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to download file',
          error: error.message
        });
      }
    }
  }
}

module.exports = FileDownloadController;
