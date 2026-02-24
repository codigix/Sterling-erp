const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const designEngineerDocumentsController = require('../../controllers/design-engineer/designEngineerDocumentsController');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('Design Engineer', 'design_engineer', 'design.engineer', 'Admin', 'Management'));

router.get('/root-cards', designEngineerDocumentsController.getAssignedRootCards);
router.get('/raw-designs/:rootCardId', designEngineerDocumentsController.getRawDesigns);
router.get('/required-documents/:rootCardId', designEngineerDocumentsController.getRequiredDocuments);
router.get('/drawing-details/:drawingId', designEngineerDocumentsController.getDrawingDetails);
router.get('/document-details/:documentId', designEngineerDocumentsController.getDocumentDetails);

module.exports = router;
