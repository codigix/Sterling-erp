const pool = require('../../config/database');
const ProductionRootCard = require('../../models/ProductionRootCard');
const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
const DepartmentTask = require('../../models/DepartmentTask');
const DesignWorkflowStep = require('../../models/DesignWorkflowStep');

exports.getProductionRootCards = async (req, res) => {
  try {
    const { status, projectId, search, rootCardId } = req.query;
    
    if (rootCardId) {
      const rootCard = await ProductionRootCard.findByRootCardId(rootCardId);
      return res.json(rootCard ? [rootCard] : []);
    }

    const filters = {};
    
    if (status) filters.status = status;
    if (projectId) filters.projectId = projectId;
    if (search) filters.search = search;

    const rootCards = await ProductionRootCard.findAll(filters);
    res.json({ rootCards, total: rootCards.length });
  } catch (error) {
    console.error('Get root cards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProductionRootCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const rootCard = await ProductionRootCard.findById(id);
    
    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    const connection = await pool.getConnection();
    try {
      const [stages] = await connection.execute(`
        SELECT id, stage_name, stage_type, status, assigned_worker, planned_start, planned_end, progress, notes
        FROM manufacturing_stages
        WHERE root_card_id = ?
        ORDER BY id ASC
      `, [id]);

      let designEngineeringDetails = null;
      if (rootCard.project_id) {
        const [projects] = await connection.execute(`
          SELECT sales_order_id FROM projects WHERE id = ?
        `, [rootCard.project_id]);

        if (projects.length > 0 && projects[0].sales_order_id) {
          designEngineeringDetails = await DesignEngineeringDetail.findByRootCardId(projects[0].sales_order_id);
        }
      }

      res.json({
        ...rootCard,
        stages: (stages && stages.length > 0) ? stages : (rootCard.stages || []),
        designEngineering: designEngineeringDetails || null
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get root card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createProductionRootCard = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { projectId, code, title, status, priority, plannedStart, plannedEnd, assignedSupervisor, notes, stages } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ message: 'Project ID and title are required' });
    }

    const [projects] = await connection.execute(
      'SELECT sales_order_id FROM projects WHERE id = ?',
      [projectId]
    );
    const rootCardIdValue = projects.length > 0 ? projects[0].sales_order_id : null;

    const rootCardId = await ProductionRootCard.create({
      projectId,
      rootCardId: rootCardIdValue,
      code,
      title,
      status: status || 'planning',
      priority: priority || 'medium',
      plannedStart,
      plannedEnd,
      createdBy: req.user.id,
      assignedSupervisor,
      notes,
      stages: stages || []
    }, connection);

    if (stages && stages.length > 0) {
      for (const stage of stages) {
        await connection.execute(`
          INSERT INTO manufacturing_stages
          (root_card_id, stage_name, stage_type, status, planned_start, planned_end, target_warehouse, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          rootCardId,
          stage.stageName,
          stage.stageType || 'in_house',
          stage.status || 'pending',
          stage.plannedStart || null,
          stage.plannedEnd || null,
          stage.targetWarehouse || null,
          stage.notes || null
        ]);
      }
    }

    await connection.commit();

    const createdProductionRootCard = await ProductionRootCard.findById(rootCardId);

    res.status(201).json({
      message: 'Root card created successfully',
      rootCardId,
      rootCard: createdProductionRootCard
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create root card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.updateProductionRootCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, priority, plannedStart, plannedEnd, assignedSupervisor, notes } = req.body;

    const connection = await pool.getConnection();
    try {
      const [existingCard] = await connection.execute('SELECT status FROM root_cards WHERE id = ?', [id]);
      const oldStatus = existingCard[0]?.status;

      const updated = await ProductionRootCard.update(id, {
        title,
        status,
        priority,
        plannedStart,
        plannedEnd,
        assignedSupervisor,
        notes
      }, connection);

      if (!updated) {
        return res.status(404).json({ message: 'Root card not found' });
      }

      const updatedCard = await ProductionRootCard.findById(id);

      if (oldStatus !== status) {
        await connection.execute(
          'INSERT INTO audit_logs (table_name, record_id, action, old_value, new_value, user_id) VALUES (?, ?, ?, ?, ?, ?)',
          ['root_cards', id, 'STATUS_CHANGE', oldStatus, status, req.user.id]
        );
      }

      res.json({
        message: 'Root card updated successfully',
        rootCard: updatedCard
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update root card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteProductionRootCard = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductionRootCard.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    res.json({ message: 'Root card deleted successfully' });
  } catch (error) {
    console.error('Delete root card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProductionRootCardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const connection = await pool.getConnection();
    try {
      const [existingCard] = await connection.execute('SELECT status FROM root_cards WHERE id = ?', [id]);
      
      if (!existingCard || existingCard.length === 0) {
        return res.status(404).json({ message: 'Root card not found' });
      }

      const oldStatus = existingCard[0].status;

      const updated = await ProductionRootCard.update(id, { status }, connection);

      if (!updated) {
        return res.status(404).json({ message: 'Root card not found' });
      }

      await connection.execute(
        'INSERT INTO audit_logs (table_name, record_id, action, old_value, new_value, user_id, timestamp) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        ['root_cards', id, 'STATUS_CHANGE', oldStatus, status, req.user.id]
      );

      const updatedCard = await ProductionRootCard.findById(id);

      res.json({
        message: 'Status updated successfully',
        rootCard: updatedCard
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update root card status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getManufacturingStages = async (req, res) => {
  try {
    const { rootCardId } = req.query;

    const connection = await pool.getConnection();
    try {
      let stages;

      if (rootCardId) {
        const [data] = await connection.execute(
          'SELECT * FROM manufacturing_stages WHERE root_card_id = ? ORDER BY id ASC',
          [rootCardId]
        );
        stages = data || [];
      } else {
        const [data] = await connection.execute('SELECT * FROM manufacturing_stages ORDER BY id ASC');
        stages = data || [];
      }

      res.json({ stages, total: stages.length });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get manufacturing stages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createManufacturingStage = async (req, res) => {
  try {
    const { rootCardId, stageName, stageType, plannedStart, plannedEnd, targetWarehouse, notes } = req.body;

    if (!rootCardId || !stageName) {
      return res.status(400).json({ message: 'Root card ID and stage name are required' });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO manufacturing_stages (root_card_id, stage_name, stage_type, planned_start, planned_end, target_warehouse, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [rootCardId, stageName, stageType || 'in_house', plannedStart || null, plannedEnd || null, targetWarehouse || null, notes || null, 'pending']
      );

      const stageId = result.insertId;

      res.status(201).json({
        message: 'Stage created successfully',
        stageId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create manufacturing stage error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateManufacturingStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stageName, stageType, plannedStart, plannedEnd, targetWarehouse, notes } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE manufacturing_stages SET stage_name = ?, stage_type = ?, planned_start = ?, planned_end = ?, target_warehouse = ?, notes = ? WHERE id = ?',
        [stageName, stageType, plannedStart || null, plannedEnd || null, targetWarehouse || null, notes || null, id]
      );

      res.json({ message: 'Stage updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update manufacturing stage error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateStageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE manufacturing_stages SET status = ? WHERE id = ?',
        [status, id]
      );

      res.json({ message: 'Status updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update stage status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getWorkerTasks = async (req, res) => {
  try {
    const { stageId } = req.params;

    const connection = await pool.getConnection();
    try {
      const [tasks] = await connection.execute(
        'SELECT * FROM worker_tasks WHERE stage_id = ? ORDER BY id ASC',
        [stageId]
      );

      res.json({ tasks: tasks || [], total: tasks.length || 0 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get worker tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createWorkerTask = async (req, res) => {
  try {
    const { stageId, taskName, description, assignedWorker } = req.body;

    if (!stageId || !taskName) {
      return res.status(400).json({ message: 'Stage ID and task name are required' });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO worker_tasks (stage_id, task_name, description, assigned_worker, status) VALUES (?, ?, ?, ?, ?)',
        [stageId, taskName, description || null, assignedWorker || null, 'pending']
      );

      const taskId = result.insertId;

      res.status(201).json({
        message: 'Task created successfully',
        taskId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create worker task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE worker_tasks SET status = ? WHERE id = ?',
        [status, id]
      );

      res.json({ message: 'Status updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.autoGenerateDesignTasks = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { rootCardId } = req.params;

    if (!rootCardId) {
      return res.status(400).json({ message: 'Root card ID is required' });
    }

    const [rootCard] = await connection.execute('SELECT * FROM root_cards WHERE id = ?', [rootCardId]);

    if (!rootCard || rootCard.length === 0) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    const card = rootCard[0];

    const standardTasks = [
      { name: 'Initial Design Review', estimatedHours: 8, priority: 'high' },
      { name: 'Requirement Analysis', estimatedHours: 16, priority: 'high' },
      { name: 'CAD Modeling', estimatedHours: 40, priority: 'high' },
      { name: 'Design Review & Approval', estimatedHours: 8, priority: 'medium' },
      { name: 'Technical Drawing Finalization', estimatedHours: 16, priority: 'medium' },
      { name: 'BOM Preparation', estimatedHours: 12, priority: 'medium' },
      { name: 'Design Documentation', estimatedHours: 8, priority: 'low' },
    ];

    const createdTasks = [];

    for (const task of standardTasks) {
      const [result] = await connection.execute(
        `INSERT INTO design_workflow_steps 
         (root_card_id, step_name, estimated_hours, priority_level, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [rootCardId, task.name, task.estimatedHours, task.priority, 'pending', req.user.id]
      );

      createdTasks.push({
        id: result.insertId,
        name: task.name,
        estimatedHours: task.estimatedHours,
        priority: task.priority,
        status: 'pending'
      });
    }

    await connection.commit();

    res.status(201).json({
      message: 'Design tasks generated successfully',
      tasks: createdTasks
    });
  } catch (error) {
    await connection.rollback();
    console.error('Auto-generate design tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.createWorkflowBasedTasks = async (req, res) => {
  let connection = null;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const { rootCardId } = req.params;
    const userId = req.user?.id;

    if (!rootCardId || !userId) {
      return res.status(400).json({ message: 'Root card ID and user ID are required' });
    }

    // Get root card details including sales_order_id
    const [rootCards] = await connection.execute(
      'SELECT id, sales_order_id, created_by FROM root_cards WHERE id = ?',
      [rootCardId]
    );

    if (rootCards.length === 0) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    const rootCard = rootCards[0];
    const baseRootCardId = rootCard.sales_order_id;

    // Get all active workflow steps ordered by step_order
    const [workflowSteps] = await connection.execute(
      'SELECT id, step_name, description, priority, step_order FROM design_workflow_steps WHERE is_active = TRUE ORDER BY step_order ASC'
    );

    if (workflowSteps.length === 0) {
      return res.status(400).json({ message: 'No active workflow steps defined' });
    }

    const createdTasks = [];

    // Create employee_tasks for each workflow step
    for (const step of workflowSteps) {
      const [result] = await connection.execute(
        `INSERT INTO employee_tasks 
         (employee_id, title, description, type, priority, status, related_id, related_type, due_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
        [
          userId,
          step.step_name,
          step.description || null,
          'design_workflow',
          step.priority || 'medium',
          'pending',
          rootCardId,
          'root_card',
          `Step ${step.step_order}: ${step.step_name}`
        ]
      );

      createdTasks.push({
        id: result.insertId,
        stepName: step.step_name,
        priority: step.priority || 'medium',
        status: 'pending'
      });
    }

    // Update employee_tasks with baseRootCardId if the column exists
    try {
      if (baseRootCardId) {
        await connection.execute(
          `UPDATE employee_tasks 
           SET sales_order_id = ? 
           WHERE related_id = ? AND related_type = 'root_card'`,
          [baseRootCardId, rootCardId]
        );
      }
    } catch (err) {
      console.warn('Could not update sales_order_id on employee_tasks:', err.message);
    }

    await connection.commit();

    res.status(201).json({
      message: 'Workflow-based tasks created successfully',
      totalCreated: createdTasks.length,
      workflowSteps: workflowSteps.length,
      tasks: createdTasks
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError.message);
      }
    }
    console.error('Create workflow-based tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.getProductionStatistics = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [totalPlans] = await connection.execute(
        'SELECT COUNT(*) as count FROM production_plans'
      );
      const [inProgressPlans] = await connection.execute(
        "SELECT COUNT(*) as count FROM production_plans WHERE status = 'in_progress'"
      );
      const [completedPlans] = await connection.execute(
        "SELECT COUNT(*) as count FROM production_plans WHERE status = 'completed'"
      );

      const stats = {
        totalPlans: totalPlans[0].count || 0,
        inProgressPlans: inProgressPlans[0].count || 0,
        completedPlans: completedPlans[0].count || 0
      };

      res.json(stats);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get production statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProductionPlans = async (req, res) => {
  try {
    const { status, projectId, search } = req.query;
    const ProductionPlan = require('../../models/ProductionPlan');

    const filters = {};
    if (status && status !== 'all') filters.status = status;
    if (projectId) filters.projectId = projectId;
    if (search) filters.search = search;

    const plans = await ProductionPlan.findAll(filters);
    res.json({ plans, total: plans.length });
  } catch (error) {
    console.error('Get production plans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProductionPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const ProductionPlan = require('../../models/ProductionPlan');

    const plan = await ProductionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Production plan not found' });
    }

    const finishedGoods = await ProductionPlan.getFinishedGoods(id);
    res.json({
      ...plan,
      finishedGoods: finishedGoods || []
    });
  } catch (error) {
    console.error('Get production plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createProductionPlan = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { rootCardId, bomId, planName, status, plannedStartDate, plannedEndDate, estimatedCompletionDate, supervisorId, notes, finishedGoods } = req.body;

    if (!planName) {
      return res.status(400).json({ message: 'Plan name is required' });
    }

    const ProductionPlan = require('../../models/ProductionPlan');
    const planId = await ProductionPlan.create({
      rootCardId,
      bomId,
      planName,
      status: status || 'draft',
      plannedStartDate,
      plannedEndDate,
      estimatedCompletionDate,
      supervisorId,
      notes
    }, connection);

    if (finishedGoods && finishedGoods.length > 0) {
      await ProductionPlan.addFinishedGoods(planId, finishedGoods, connection);
    }

    if (rootCardId) {
      try {
        const [productionPlanDetail] = await connection.execute(
          'SELECT selected_phases FROM production_plan_details WHERE sales_order_id = ? LIMIT 1',
          [rootCardId]
        );

        console.log(`[Production Plan] Fetched production_plan_details for rootCardId ${rootCardId}:`, productionPlanDetail);

        if (productionPlanDetail && productionPlanDetail[0]) {
          let selectedPhases = {};
          const phasesData = productionPlanDetail[0].selected_phases;
          
          console.log(`[Production Plan] Raw phases data:`, phasesData);

          if (typeof phasesData === 'string') {
            try {
              selectedPhases = JSON.parse(phasesData);
            } catch (e) {
              console.warn(`[Production Plan] Failed to parse JSON phases:`, e.message);
              selectedPhases = {};
            }
          } else if (typeof phasesData === 'object') {
            selectedPhases = phasesData || {};
          }

          console.log(`[Production Plan] Parsed phases:`, selectedPhases);

          if (Object.keys(selectedPhases).length > 0) {
            for (const phaseName of Object.keys(selectedPhases)) {
              console.log(`[Production Plan] Creating stage for phase: ${phaseName}`);

              const [stageResult] = await connection.execute(
                `INSERT INTO production_stages 
                 (production_plan_id, stage_name, stage_type, status, target_warehouse)
                 VALUES (?, ?, ?, ?, ?)`,
                [planId, phaseName, 'manufacturing', 'pending', selectedPhases[phaseName]?.targetWarehouse || null]
              );

              console.log(`[Production Plan] Created stage with ID:`, stageResult.insertId);
            }
          }
        }
      } catch (detailError) {
        console.warn(`[Production Plan] Non-critical error fetching phases:`, detailError.message);
      }
    }

    await connection.commit();

    const createdPlan = await ProductionPlan.findById(planId);

    res.status(201).json({
      success: true,
      message: 'Production plan created successfully',
      data: {
        planId,
        plan: createdPlan
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create production plan error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  } finally {
    connection.release();
  }
};

exports.updateProductionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, status, plannedStartDate, plannedEndDate, estimatedCompletionDate, supervisorId, notes } = req.body;

    const ProductionPlan = require('../../models/ProductionPlan');

    const updated = await ProductionPlan.update(id, {
      planName,
      status,
      plannedStartDate,
      plannedEndDate,
      estimatedCompletionDate,
      supervisorId,
      notes
    });

    if (!updated) {
      return res.status(404).json({ message: 'Production plan not found' });
    }

    const updatedPlan = await ProductionPlan.findById(id);

    res.json({
      message: 'Production plan updated successfully',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Update production plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProductionPlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const ProductionPlan = require('../../models/ProductionPlan');

    const updated = await ProductionPlan.update(id, { status });

    if (!updated) {
      return res.status(404).json({ message: 'Production plan not found' });
    }

    const updatedPlan = await ProductionPlan.findById(id);

    res.json({
      message: 'Status updated successfully',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Update production plan status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteProductionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const ProductionPlan = require('../../models/ProductionPlan');

    const plan = await ProductionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Production plan not found' });
    }

    await ProductionPlan.delete(id);
    res.json({ message: 'Production plan deleted successfully' });
  } catch (error) {
    console.error('Delete production plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createProductionRootCardStage = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { stageName, stageType, status, plannedStart, plannedEnd, targetWarehouse, notes, assignedWorker } = req.body;

    if (!stageName) {
      return res.status(400).json({ message: 'Stage name is required' });
    }

    const [result] = await connection.execute(
      `INSERT INTO manufacturing_stages 
       (root_card_id, stage_name, stage_type, status, planned_start, planned_end, target_warehouse, notes, assigned_worker)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, stageName, stageType || 'in_house', status || 'pending', plannedStart || null, plannedEnd || null, targetWarehouse || null, notes || null, assignedWorker || null]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Stage created successfully',
      stageId: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create root card stage error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.deleteProductionRootCardStage = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id, stageId } = req.params;

    const [result] = await connection.execute(
      'DELETE FROM manufacturing_stages WHERE id = ? AND root_card_id = ?',
      [stageId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    await connection.commit();

    res.json({ message: 'Stage deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete root card stage error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.getReadyForProduction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [readyItems] = await connection.execute(`
      SELECT 
        so.id,
        so.po_number,
        so.customer,
        so.total,
        so.created_at,
        ppd.selected_phases,
        p.id as project_id,
        p.name as project_name,
        p.code as project_code
      FROM sales_orders so
      LEFT JOIN production_plan_details ppd ON so.id = ppd.sales_order_id
      LEFT JOIN projects p ON so.id = p.sales_order_id
      WHERE ppd.selected_phases IS NOT NULL 
        AND ppd.selected_phases != '{}'
        AND ppd.selected_phases != ''
        AND NOT EXISTS (
          SELECT 1 FROM production_plans pp WHERE pp.sales_order_id = so.id
        )
      ORDER BY so.created_at DESC
    `);

    const items = readyItems.map(item => ({
      id: item.id,
      orderNumber: item.po_number,
      customerName: item.customer,
      totalAmount: item.total,
      createdDate: item.created_at,
      projectName: item.project_name,
      projectCode: item.project_code,
      projectId: item.project_id,
      selectedPhases: typeof item.selected_phases === 'string' 
        ? JSON.parse(item.selected_phases) 
        : item.selected_phases || {}
    }));

    res.json({ 
      success: true,
      data: {
        readyItems: items,
        total: items.length
      }
    });
  } catch (error) {
    console.error('Get ready for production error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  } finally {
    connection.release();
  }
};
