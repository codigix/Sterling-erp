const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const fileDownloadController = require('../../controllers/files/fileDownloadController');

const router = express.Router();

router.use(authMiddleware);

router.get('/download', fileDownloadController.downloadFile);

module.exports = router;
