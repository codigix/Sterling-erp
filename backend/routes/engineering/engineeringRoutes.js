const express = require('express');
const multer = require('multer');
const path = require('path');
const { createCustomStorage } = require('../../utils/multerStorage');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const engineeringController = require('../../controllers/engineering/engineeringController');

const router = express.Router();

const upload = multer({
  storage: createCustomStorage(path.join(__dirname, '../../uploads/engineering')),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/x-cad'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.use(authMiddleware);

router.get('/documents', roleMiddleware('Admin', 'Engineering', 'engineering', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Production', 'production_manager'), engineeringController.getDocuments);

router.use(roleMiddleware('Admin', 'Engineering', 'engineering', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'));

router.post('/documents/upload', upload.single('document'), engineeringController.uploadDocument);
router.patch('/documents/:id/approve', engineeringController.approveDocument);

module.exports = router;
