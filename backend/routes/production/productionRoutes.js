const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createCustomStorage } = require('../../utils/multerStorage');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const productionController = require('../../controllers/production/productionController');
const designEngineeringController = require('../../controllers/root-cards/designEngineeringController');
const drawingController = require('../../controllers/production/drawingController');
const specificationController = require('../../controllers/production/specificationController');
const technicalFileController = require('../../controllers/production/technicalFileController');

const upload = multer({
  storage: createCustomStorage(path.join(__dirname, '../../uploads/design-engineering')),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.use(authMiddleware);

router.get('/root-cards', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer', 'Inventory', 'inventory_manager', 'Inventory Manager'), productionController.getProductionRootCards);
router.post('/root-cards', roleMiddleware('Admin', 'Management'), productionController.createProductionRootCard);
router.get('/root-cards/:id', roleMiddleware('Admin', 'Management', 'Production', 'Inventory', 'inventory_manager', 'Inventory Manager'), productionController.getProductionRootCardById);
router.put('/root-cards/:id', roleMiddleware('Admin', 'Management'), productionController.updateProductionRootCard);
router.patch('/root-cards/:id', roleMiddleware('Admin', 'Management'), productionController.updateProductionRootCard);
router.patch('/root-cards/:id/status', roleMiddleware('Admin', 'Management', 'Production', 'Inventory', 'inventory_manager', 'Inventory Manager'), productionController.updateProductionRootCardStatus);
router.delete('/root-cards/:id', roleMiddleware('Admin', 'Management', 'Inventory', 'inventory_manager', 'Inventory Manager'), productionController.deleteProductionRootCard);
router.post('/root-cards/:id/stages', roleMiddleware('Admin', 'Management'), productionController.createProductionRootCardStage);
router.delete('/root-cards/:id/stages/:stageId', roleMiddleware('Admin', 'Management'), productionController.deleteProductionRootCardStage);

router.get('/manufacturing-stages', roleMiddleware('Admin', 'Management', 'Production'), productionController.getManufacturingStages);
router.post('/manufacturing-stages', roleMiddleware('Admin', 'Management'), productionController.createManufacturingStage);
router.put('/manufacturing-stages/:id', roleMiddleware('Admin', 'Management'), productionController.updateManufacturingStage);
router.patch('/manufacturing-stages/:id/status', roleMiddleware('Admin', 'Management', 'Production'), productionController.updateStageStatus);

router.get('/worker-tasks/:stageId', roleMiddleware('Admin', 'Management', 'Production'), productionController.getWorkerTasks);
router.post('/worker-tasks', roleMiddleware('Admin', 'Management'), productionController.createWorkerTask);
router.patch('/worker-tasks/:id/status', roleMiddleware('Admin', 'Management', 'Production'), productionController.updateTaskStatus);

router.get('/statistics', roleMiddleware('Admin', 'Management', 'Production'), productionController.getProductionStatistics);

// Drawing routes
router.get('/drawings', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer'), drawingController.getDrawings);
router.post('/drawings', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), upload.single('file'), drawingController.uploadDrawing);
router.get('/drawings/:id/download', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer'), drawingController.downloadDrawing);
router.patch('/drawings/:id/approve', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), drawingController.approveDrawing);
router.delete('/drawings/:id', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), drawingController.deleteDrawing);

// Specification routes
router.get('/specifications', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer'), specificationController.getSpecifications);
router.post('/specifications', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), upload.single('file'), specificationController.createSpecification);
router.put('/specifications/:id', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), upload.single('file'), specificationController.updateSpecification);
router.patch('/specifications/:id', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), upload.single('file'), specificationController.updateSpecification);
router.patch('/specifications/:id/approve', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), specificationController.approveSpecification);
router.get('/specifications/:id/download', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer'), specificationController.downloadSpecification);
router.delete('/specifications/:id', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), specificationController.deleteSpecification);

// Technical Files routes
router.get('/technical-files', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer'), technicalFileController.getTechnicalFiles);
router.post('/technical-files', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), upload.single('file'), technicalFileController.createTechnicalFile);
router.get('/technical-files/:id/download', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer'), technicalFileController.downloadTechnicalFile);
router.delete('/technical-files/:id', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), technicalFileController.deleteTechnicalFile);

// Production Plan routes
router.get('/plans', roleMiddleware('Admin', 'Management', 'Production'), productionController.getProductionPlans);
router.get('/ready-for-production', roleMiddleware('Admin', 'Management', 'Production'), productionController.getReadyForProduction);

// Design routes
router.get('/designs', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer'), productionController.getDesigns);
router.get('/designs/:id', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer'), productionController.getDesignById);
router.get('/designs/:id/download', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer'), productionController.downloadDesignDocument);
router.post('/design-projects', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), upload.array('documents'), productionController.createDesignProject);
router.patch('/designs/:id/status', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), productionController.updateDesignStatus);
router.delete('/designs/:id', roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer'), productionController.deleteDesignProject);

router.post('/plans', roleMiddleware('Admin', 'Management'), productionController.createProductionPlan);
router.get('/plans/:id', roleMiddleware('Admin', 'Management', 'Production'), productionController.getProductionPlanById);
router.patch('/plans/:id', roleMiddleware('Admin', 'Management'), productionController.updateProductionPlan);
router.patch('/plans/:id/status', roleMiddleware('Admin', 'Management', 'Production'), productionController.updateProductionPlanStatus);
router.delete('/plans/:id', roleMiddleware('Admin', 'Management'), productionController.deleteProductionPlan);

module.exports = router;
