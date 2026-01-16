const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const comprehensiveBOMController = require('../../controllers/engineering/comprehensiveBOMController');

router.use(authMiddleware);

router.post('/', 
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'Engineering'),
  comprehensiveBOMController.createComprehensiveBOM
);

router.get('/',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'Engineering', 'Production'),
  comprehensiveBOMController.getComprehensiveBOMList
);

router.get('/:id',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'Engineering', 'Production'),
  comprehensiveBOMController.getComprehensiveBOM
);

router.put('/:id',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'Engineering'),
  comprehensiveBOMController.updateComprehensiveBOM
);

router.delete('/:id',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'Engineering'),
  comprehensiveBOMController.deleteComprehensiveBOM
);

router.get('/:id/costs',
  roleMiddleware('Admin', 'Management', 'Design Engineer', 'Engineering', 'Production'),
  comprehensiveBOMController.getBOMCosts
);

module.exports = router;
