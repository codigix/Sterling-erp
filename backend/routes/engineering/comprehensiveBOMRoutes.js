const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const comprehensiveBOMController = require('../../controllers/engineering/comprehensiveBOMController');

router.use(authMiddleware);

router.post('/', 
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering'),
  comprehensiveBOMController.createComprehensiveBOM
);

router.get('/',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Production', 'production', 'production_manager'),
  comprehensiveBOMController.getComprehensiveBOMList
);

router.get('/root-card/:rootCardId',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Production', 'production', 'production_manager'),
  comprehensiveBOMController.getComprehensiveBOMByRootCard
);

router.get('/root-card/:rootCardId/all',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Production', 'production', 'production_manager'),
  comprehensiveBOMController.getComprehensiveBOMsByRootCard
);

router.get('/:id',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Production', 'production', 'production_manager'),
  comprehensiveBOMController.getComprehensiveBOM
);

router.put('/:id',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering'),
  comprehensiveBOMController.updateComprehensiveBOM
);

router.delete('/:id',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering'),
  comprehensiveBOMController.deleteComprehensiveBOM
);

router.get('/:id/costs',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Production', 'production', 'production_manager'),
  comprehensiveBOMController.getBOMCosts
);

router.patch('/:id/status',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering'),
  comprehensiveBOMController.updateBOMStatus
);

module.exports = router;
