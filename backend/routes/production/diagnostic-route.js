const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/debug/user-info', authMiddleware, (req, res) => {
  res.json({
    userId: req.user.id,
    userId_type: typeof req.user.id,
    userId_parsed: parseInt(req.user.id),
    username: req.user.username,
    role: req.user.role
  });
});

router.get('/debug/root-card/:id', authMiddleware, async (req, res) => {
  try {
    const RootCard = require('../../models/RootCard');
    const RootCardStep = require('../../models/RootCardStep');
    const ManufacturingStage = require('../../models/ManufacturingStage');
    
    const { id } = req.params;
    const userId = parseInt(req.user.id);

    const rootCard = await RootCard.findById(id);
    if (!rootCard) {
      return res.json({ error: 'Root card not found' });
    }

    let stepInfo = [];
    if (rootCard.sales_order_id) {
      const allSteps = await RootCardStep.findBySalesOrderId(rootCard.sales_order_id);
      stepInfo = allSteps.map(s => ({
        id: s.id,
        step_id: s.step_id,
        assigned_to: s.assigned_to,
        assigned_to_type: typeof s.assigned_to,
        matches_user: s.assigned_to && parseInt(s.assigned_to) === userId
      }));
    }

    const manufacturingStages = await ManufacturingStage.findByRootCardIds([parseInt(id)]);
    const stageInfo = manufacturingStages.map(s => ({
      id: s.id,
      stage_name: s.stage_name,
      assigned_worker: s.assigned_worker,
      assigned_worker_type: typeof s.assigned_worker,
      matches_user: s.assigned_worker && parseInt(s.assigned_worker) === userId
    }));

    res.json({
      currentUser: {
        userId: userId,
        userId_type: typeof userId
      },
      rootCard: {
        id: rootCard.id,
        project: rootCard.project,
        projectId: rootCard.project_id,
        salesOrderId: rootCard.sales_order_id
      },
      salesOrderSteps: stepInfo,
      manufacturingStages: stageInfo,
      access: {
        hasStepAccess: stepInfo.some(s => s.matches_user),
        hasStageAccess: stageInfo.some(s => s.matches_user),
        allowed: stepInfo.some(s => s.matches_user) || stageInfo.some(s => s.matches_user)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
