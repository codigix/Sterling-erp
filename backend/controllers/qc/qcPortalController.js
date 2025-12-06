exports.getGRNInspections = async (req, res) => {
  try {
    const grnInspections = [
      {
        id: 'GRN-001',
        poNumber: 'PO-2025-001',
        vendor: 'Steel Supplies Ltd',
        receivedDate: '2025-01-28',
        items: 50,
        qcStatus: 'pending',
        acceptedItems: 0,
        rejectedItems: 0
      },
      {
        id: 'GRN-002',
        poNumber: 'PO-2025-002',
        vendor: 'Electrical Components Co',
        receivedDate: '2025-01-25',
        items: 30,
        qcStatus: 'in-progress',
        acceptedItems: 28,
        rejectedItems: 0
      },
      {
        id: 'GRN-003',
        poNumber: 'PO-2025-003',
        vendor: 'Fasteners Ltd',
        receivedDate: '2025-01-20',
        items: 100,
        qcStatus: 'completed',
        acceptedItems: 95,
        rejectedItems: 5
      }
    ];

    const stats = {
      totalGRN: grnInspections.length,
      pendingGRN: grnInspections.filter(g => g.qcStatus === 'pending').length,
      inProgressGRN: grnInspections.filter(g => g.qcStatus === 'in-progress').length,
      completedGRN: grnInspections.filter(g => g.qcStatus === 'completed').length
    };

    res.json({ grnInspections, stats });
  } catch (error) {
    console.error('Get GRN inspections error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStageQC = async (req, res) => {
  try {
    const stageQC = [
      {
        id: 'STQC-001',
        stage: 'In-house Assembly Stage 1',
        projectId: 'PROJ-001',
        status: 'pending',
        dueDate: '2025-02-05'
      },
      {
        id: 'STQC-002',
        stage: 'Outsourced - Painting',
        projectId: 'PROJ-002',
        status: 'pending',
        dueDate: '2025-02-08'
      },
      {
        id: 'STQC-003',
        stage: 'Testing & Assembly',
        projectId: 'PROJ-001',
        status: 'completed',
        dueDate: '2025-01-20'
      }
    ];

    const stats = {
      totalStageQC: stageQC.length,
      pendingStageQC: stageQC.filter(s => s.status === 'pending').length,
      inProgressStageQC: stageQC.filter(s => s.status === 'in-progress').length,
      completedStageQC: stageQC.filter(s => s.status === 'completed').length
    };

    res.json({ stageQC, stats });
  } catch (error) {
    console.error('Get stage QC error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
