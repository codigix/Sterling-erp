const RootCard = require('../../models/RootCard');
const RootCardStep = require('../../models/RootCardStep');
const ManufacturingStage = require('../../models/ManufacturingStage');

exports.getUserInfo = (req, res) => {
  res.json({
    userId: req.user.id,
    userId_type: typeof req.user.id,
    userId_parsed: parseInt(req.user.id),
    username: req.user.username,
    role: req.user.role
  });
};

exports.debugRootCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user.id);

    const rootCard = await RootCard.findById(id);
    if (!rootCard) {
      return res.json({ error: 'Root card not found' });
    }

    let stepInfo = [];
    if (rootCard.rootCardId) {
      const allSteps = await RootCardStep.findByRootCardId(rootCard.rootCardId);
      stepInfo = allSteps.map(s => ({
        id: s.id,
        step_id: s.step_id,
        assigned_to: s.assigned_to,
        assigned_to_type: typeof s.assigned_to,
        assigned_to_parsed: s.assigned_to ? parseInt(s.assigned_to) : null,
        matches_user: s.assigned_to && parseInt(s.assigned_to) === userId
      }));
    }

    const manufacturingStages = await ManufacturingStage.findByRootCardIds([parseInt(id)]);
    const stageInfo = manufacturingStages.map(s => ({
      id: s.id,
      stage_name: s.stage_name,
      assigned_worker: s.assigned_worker,
      assigned_worker_type: typeof s.assigned_worker,
      assigned_worker_parsed: s.assigned_worker ? parseInt(s.assigned_worker) : null,
      matches_user: s.assigned_worker && parseInt(s.assigned_worker) === userId
    }));

    res.json({
      currentUser: {
        userId: userId,
        userId_type: typeof userId,
        reqUserId: req.user.id,
        reqUserId_type: typeof req.user.id
      },
      rootCard: {
        id: rootCard.id,
        project: rootCard.project,
        projectId: rootCard.project_id,
        rootCardId: rootCard.rootCardId
      },
      rootCardSteps: stepInfo,
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
};
