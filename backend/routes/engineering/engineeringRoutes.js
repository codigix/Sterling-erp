const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const engineeringController = require('../../controllers/engineering/engineeringController');

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../../uploads/engineering'),
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
router.use(roleMiddleware('Admin', 'Engineering', 'Management', 'Design Engineer'));

router.post('/documents/upload', upload.single('document'), engineeringController.uploadDocument);
router.get('/documents', engineeringController.getDocuments);
router.patch('/documents/:id/approve', engineeringController.approveDocument);

router.post('/bom/generate', engineeringController.generateBOM);
router.get('/bom/:id', engineeringController.getBOMDetails);
router.get('/bom', engineeringController.getSalesOrderBOMs);
router.patch('/bom/:id/status', engineeringController.updateBOMStatus);

module.exports = router;
