exports.getRootCards = async (req, res) => {
  try {
    const rootCards = [
      {
        id: 'RC-001',
        projectId: 'PROJ-001',
        projectName: 'Motor Assembly Unit',
        status: 'in-progress',
        createdDate: '2025-01-20',
        stages: 4,
        completedStages: 1
      },
      {
        id: 'RC-002',
        projectId: 'PROJ-002',
        projectName: 'Control Panel',
        status: 'pending',
        createdDate: '2025-01-25',
        stages: 3,
        completedStages: 0
      },
      {
        id: 'RC-003',
        projectId: 'PROJ-003',
        projectName: 'Hydraulic System',
        status: 'completed',
        createdDate: '2025-01-05',
        stages: 5,
        completedStages: 5
      }
    ];

    const stats = {
      totalRootCards: rootCards.length,
      inProgressRootCards: rootCards.filter(rc => rc.status === 'in-progress').length,
      pendingRootCards: rootCards.filter(rc => rc.status === 'pending').length,
      completedRootCards: rootCards.filter(rc => rc.status === 'completed').length
    };

    res.json({ rootCards, stats });
  } catch (error) {
    console.error('Get root cards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProductionStages = async (req, res) => {
  try {
    const stages = [
      {
        id: 'STAGE-001',
        rootCard: 'RC-001',
        stageName: 'In-house Assembly Stage 1',
        type: 'in-house',
        status: 'in-progress',
        startDate: '2025-01-21',
        endDate: null,
        progress: 60
      },
      {
        id: 'STAGE-002',
        rootCard: 'RC-001',
        stageName: 'Outsourced - Painting',
        type: 'outsourced',
        status: 'pending',
        startDate: null,
        endDate: null,
        progress: 0
      },
      {
        id: 'STAGE-003',
        rootCard: 'RC-002',
        stageName: 'Assembly',
        type: 'in-house',
        status: 'pending',
        startDate: null,
        endDate: null,
        progress: 0
      }
    ];

    const stats = {
      totalStages: stages.length,
      inProgressStages: stages.filter(s => s.status === 'in-progress').length,
      pendingStages: stages.filter(s => s.status === 'pending').length,
      completedStages: stages.filter(s => s.status === 'completed').length
    };

    res.json({ stages, stats });
  } catch (error) {
    console.error('Get production stages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
