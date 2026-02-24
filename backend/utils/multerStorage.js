const multer = require('multer');
const path = require('path');
const fs = require('fs');

function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
}

function createCustomStorage(uploadDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      const sanitized = sanitizeFilename(basename);
      
      const filename = `${sanitized}_${timestamp}_${random}${ext}`;
      cb(null, filename);
    }
  });
}

module.exports = {
  sanitizeFilename,
  createCustomStorage
};
