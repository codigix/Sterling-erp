const express = require('express');
const designProjectController = require('../../controllers/design/designProjectController');

const router = express.Router();

router.get('/', designProjectController.getAllProjects);
router.post('/', designProjectController.createProject);
router.get('/:id', designProjectController.getProjectById);
router.put('/:id', designProjectController.updateProject);
router.patch('/:id/status', designProjectController.updateProjectStatus);
router.delete('/:id', designProjectController.deleteProject);

module.exports = router;
