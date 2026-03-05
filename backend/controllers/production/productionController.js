const pool = require('../../config/database');
const ProductionRootCard = require('../../models/ProductionRootCard');
const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
const DepartmentTask = require('../../models/DepartmentTask');
const DesignWorkflowStep = require('../../models/DesignWorkflowStep');
const Role = require('../../models/Role');

exports.getProductionRootCards = async (req, res) => {
  try {
    const { status, projectId, search, rootCardId, hasMaterialRequests } = req.query;
    
    // Authorization: Only show root cards that have been "Sent to Production" in sales_orders_management
    // OR have material requests (for inventory managers)
    const [sentOrders] = await pool.execute(
      "SELECT root_card_id FROM sales_orders_management WHERE status = 'Sent to Production'"
    );
    const sentRootCardIds = sentOrders.map(o => o.root_card_id);

    // Get root card IDs that have material requests
    const [mrRows] = await pool.execute(
      "SELECT DISTINCT sales_order_id as root_card_id FROM material_requests"
    );
    const mrRootCardIds = mrRows.map(mr => mr.root_card_id);

    // Combine both sets of IDs
    const authorizedRootCardIds = [...new Set([...sentRootCardIds, ...mrRootCardIds])];

    if (rootCardId) {
      const rootCard = await ProductionRootCard.findByRootCardId(rootCardId);
      if (rootCard && authorizedRootCardIds.includes(rootCard.sales_order_id)) {
        return res.json([rootCard]);
      }
      return res.json([]);
    }

    const filters = {};
    
    if (status) filters.status = status;
    if (projectId) filters.projectId = projectId;
    if (search) filters.search = search;

    let allRootCards = await ProductionRootCard.findAll(filters);
    
    // Filter by authorized sales_order_ids
    let authorizedRootCards = allRootCards.filter(rc => 
      rc.sales_order_id && authorizedRootCardIds.includes(rc.sales_order_id)
    );

    // Filter: only root cards with material requests if specifically requested
    if (hasMaterialRequests === 'true') {
      authorizedRootCards = authorizedRootCards.filter(rc => 
        mrRootCardIds.includes(rc.sales_order_id)
      );
    }

    res.json({ rootCards: authorizedRootCards, total: authorizedRootCards.length });
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

exports.internalCreateWorkflowTasks = async (rootCardId, userId, connection, type = 'design') => {
  if (!rootCardId || !userId) {
    throw new Error('Root card ID and user ID are required');
  }

  // No longer strictly requiring an employee record to exist,
  // since tasks are assigned to roles, and assigned_by is users.id.
  // The effectiveEmployeeId was previously assigned but unused.

  const createdTasks = [];

  // Get appropriate role ID
  let roleId = null;
  let roleSearchNames = [];
  
  if (type === 'production') {
    roleSearchNames = ['Production', 'production', 'Production Manager', 'production_manager'];
  } else if (type === 'inventory') {
    roleSearchNames = ['Inventory', 'inventory', 'inventory_manager', 'Inventory Manager'];
  } else {
    roleSearchNames = ['Design Engineer', 'design_engineer', 'Design Engineering', 'Design engineering'];
  }

  const rolePlaceholders = roleSearchNames.map(() => '?').join(',');
  
  const [userRole] = await connection.execute(
    `SELECT r.id FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ? AND r.name IN (${rolePlaceholders})`,
    [userId, ...roleSearchNames]
  );

  if (userRole.length > 0) {
    roleId = userRole[0].id;
  } else {
    const [roles] = await connection.execute(
      `SELECT id FROM roles WHERE name IN (${rolePlaceholders}) ORDER BY (CASE WHEN name = ? THEN 1 ELSE 2 END) LIMIT 1`,
      [...roleSearchNames, roleSearchNames[0]]
    );
    roleId = roles.length > 0 ? roles[0].id : null;
  }

  // Get root card details
  const [rootCards] = await connection.execute(
    'SELECT id, sales_order_id, created_by FROM root_cards WHERE id = ? OR sales_order_id = ?',
    [rootCardId, rootCardId]
  );

  let effectiveRootCardId;
  let baseSalesOrderId;

  if (rootCards.length === 0) {
    const [salesOrders] = await connection.execute(
      `SELECT so.*, p.id as project_id 
       FROM sales_orders so
       LEFT JOIN projects p ON p.sales_order_id = so.id
       WHERE so.id = ?`,
      [rootCardId]
    );
    
    if (salesOrders.length === 0) {
      throw new Error('Root card or Sales Order not found');
    }
    
    const so = salesOrders[0];
    let projectId = so.project_id;
    
    // Ensure a project exists as project_id is NOT NULL in root_cards
    if (!projectId) {
      const [projectResult] = await connection.execute(
        `INSERT INTO projects (name, sales_order_id, client_name, po_number, status)
         VALUES (?, ?, ?, ?, ?)`,
        [
          so.project_name || `Project for SO ${so.id}`,
          so.id,
          so.customer || null,
          so.po_number || null,
          'draft'
        ]
      );
      projectId = projectResult.insertId;
    }
    
    const [result] = await connection.execute(
      `INSERT INTO root_cards
       (project_id, sales_order_id, code, title, status, priority, planned_end, created_by, notes, stages)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        so.id,
        so.po_number || null,
        so.project_name || `${type === 'production' ? 'Production' : 'Design'} Project`,
        'planning',
        'medium',
        so.due_date || null,
        userId,
        JSON.stringify({ auto_created: true, from_workflow: true, workflow_type: type }),
        '[]'
      ]
    );
    
    effectiveRootCardId = result.insertId;
    baseSalesOrderId = so.id;
  } else {
    const rootCard = rootCards[0];
    effectiveRootCardId = rootCard.id;
    baseSalesOrderId = rootCard.sales_order_id;
  }

  const workflowTables = {
    'production': 'production_workflow_steps',
    'design': 'design_workflow_steps',
    'inventory': 'inventory_workflow_steps'
  };
  const workflowTable = workflowTables[type] || 'design_workflow_steps';
  
  // Cleanup existing workflow tasks of this type
  await connection.execute(
    `DELETE FROM department_tasks 
     WHERE (root_card_id = ? OR sales_order_id = ?) 
     AND JSON_EXTRACT(notes, '$.workflow_type') = ? 
     AND JSON_EXTRACT(notes, '$.workflow_step') = true`,
    [effectiveRootCardId, baseSalesOrderId, type]
  );

  const [workflowSteps] = await connection.execute(
    `SELECT id, step_name, description, priority, step_order, task_template_title, task_template_description 
     FROM ${workflowTable} WHERE is_active = TRUE ORDER BY step_order ASC`
  );

  // Check if material request already exists for this sales order
  let mrExists = false;
  if (type === 'production' || type === 'inventory') {
    const [mrs] = await connection.execute(
      'SELECT id, status FROM material_requests WHERE sales_order_id = ? LIMIT 1',
      [baseSalesOrderId]
    );
    mrExists = mrs.length > 0;
    
    // If it exists and is approved/completed, we'll mark the corresponding task
    const mrCompleted = mrExists && (mrs[0].status === 'approved' || mrs[0].status === 'completed' || mrs[0].status === 'received');
    if (mrCompleted) mrExists = 'completed'; 
  }

  // Check if work orders already exist for this root card
  let woExists = false;
  if (type === 'production') {
    const [wos] = await connection.execute(
      'SELECT id FROM work_orders WHERE root_card_id = ? LIMIT 1',
      [effectiveRootCardId]
    );
    woExists = wos.length > 0;
  }

  if (workflowSteps.length === 0) {
    console.warn(`No active ${type} workflow steps defined`);
    return [];
  }

  // Check if a production plan already exists for this root card
  let planExists = false;
  if (type === 'production') {
    const [plans] = await connection.execute(
      'SELECT id, status FROM production_plans WHERE root_card_id = ? LIMIT 1',
      [effectiveRootCardId]
    );
    planExists = plans.length > 0;
    if (planExists && (plans[0].status === 'completed' || plans[0].status === 'approved' || plans[0].status === 'draft')) planExists = 'completed';
  }

  for (const step of workflowSteps) {
    const taskTitle = step.task_template_title || step.step_name;
    const taskDesc = step.task_template_description || step.description || null;
    
    if (roleId) {
      let initialStatus = step.step_order === 1 ? 'pending' : 'on_hold';
      
      // Handle Production Workflow Auto-Completion
      if (type === 'production') {
        if (step.step_order === 1 && planExists) {
          initialStatus = planExists === 'completed' ? 'completed' : 'pending';
        } else if (step.step_order === 2 && mrExists) {
          initialStatus = mrExists === 'completed' ? 'completed' : 'pending';
        } else if (step.step_order === 3 && woExists) {
          initialStatus = 'completed';
        }
      }

      // Handle Inventory Workflow Auto-Completion
      if (type === 'inventory' && mrExists) {
        if (step.step_order === 1) {
          initialStatus = mrExists === 'completed' ? 'completed' : 'pending';
        } else if (step.step_order === 2) {
          initialStatus = 'pending'; // Always pending if MR exists but step 2 is not yet done
        }
      }
      
      const [result] = await connection.execute(
        `INSERT INTO department_tasks 
         (root_card_id, role_id, task_title, task_description, status, priority, assigned_by, sales_order_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          effectiveRootCardId,
          roleId,
          taskTitle,
          taskDesc,
          initialStatus,
          step.priority || 'medium',
          userId,
          baseSalesOrderId,
          JSON.stringify({ 
            step_order: step.step_order, 
            auto_generated: true, 
            workflow_step: true, 
            workflow_step_name: step.step_name,
            workflow_type: type
          })
        ]
      );

      createdTasks.push({
        id: result.insertId,
        stepName: taskTitle,
        priority: step.priority || 'medium',
        status: initialStatus,
        type: 'department_task'
      });
    }
  }

  return createdTasks;
};

exports.createWorkflowBasedTasks = async (req, res) => {
  let connection = null;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const { rootCardId } = req.params;
    const { type = 'design' } = req.query; // 'design' or 'production'
    const userId = req.user?.id || req.user?.userId;

    if (!rootCardId || !userId) {
      return res.status(400).json({ message: 'Root card ID and user ID are required' });
    }

    const createdTasks = await exports.internalCreateWorkflowTasks(rootCardId, userId, connection, type);

    await connection.commit();

    res.status(201).json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} workflow-based tasks created successfully`,
      totalCreated: createdTasks.length,
      tasks: createdTasks
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Create workflow-based tasks error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.createProductionWorkflowTasks = async (req, res) => {
  req.query = { ...req.query, type: 'production' };
  return exports.createWorkflowBasedTasks(req, res);
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
    
    if (!id || id === 'null') {
      return res.json(null);
    }
    
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
        // Link the production_plan_id in production_plan_details
        const ProductionPlanDetail = require('../../models/ProductionPlanDetail');
        await ProductionPlanDetail.update(rootCardId, { productionPlanId: planId }, true);
        console.log(`[Production Plan] Linked production_plan_id ${planId} to details for rootCardId ${rootCardId}`);

        // Mark the "Create Production Plan" task as completed if it exists
        // and automatically open the next task in sequence
        const WorkflowTaskHelper = require('../../utils/workflowTaskHelper');
        await WorkflowTaskHelper.completeAndOpenNext(rootCardId, 'Create Production Plan', connection);
        
        console.log(`[Production Plan] Automatically completed workflow task for root card ${rootCardId}`);

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

exports.getDesigns = async (req, res) => {
  try {
    const { rootCardId } = req.query;
    
    let query = `
      SELECT 
        so.id,
        so.po_number as code,
        so.customer as customerName,
        p.name as projectName,
        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(ded.specifications, '$.designName')), so.project_name) as title,
        ded.design_status as status,
        ded.created_at as createdAt,
        ded.documents,
        ded.specifications as details
      FROM sales_orders so
      JOIN projects p ON so.id = p.sales_order_id
      LEFT JOIN design_engineering_details ded ON so.id = ded.sales_order_id
      WHERE (ded.id IS NOT NULL OR EXISTS (
        SELECT 1 FROM sales_order_workflow_steps sows 
        WHERE sows.sales_order_id = so.id AND sows.step_number = 2 AND sows.status != 'pending'
      ))
    `;
    
    const params = [];
    if (rootCardId) {
      query += ` AND so.id = ?`;
      params.push(rootCardId);
    }
    
    query += ` ORDER BY so.created_at DESC`;
    
    const [designs] = await pool.execute(query, params);

    const formattedDesigns = designs.map(design => ({
      ...design,
      rootCardId: design.id,
      details: typeof design.details === 'string' ? JSON.parse(design.details) : design.details || {},
      documents: typeof design.documents === 'string' ? JSON.parse(design.documents) : design.documents || []
    }));

    res.json({
      success: true,
      designs: formattedDesigns,
      total: formattedDesigns.length
    });
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const [designs] = await pool.execute(`
      SELECT 
        so.id,
        so.po_number as code,
        so.customer as customerName,
        p.name as projectName,
        COALESCE(JSON_UNQUOTE(JSON_EXTRACT(ded.specifications, '$.designName')), so.project_name) as title,
        ded.design_status as status,
        ded.created_at as createdAt,
        ded.documents,
        ded.specifications as details,
        ded.bom_data as bomData,
        ded.drawings_3d as drawings3D,
        ded.design_notes as designNotes
      FROM sales_orders so
      JOIN projects p ON so.id = p.sales_order_id
      LEFT JOIN design_engineering_details ded ON so.id = ded.sales_order_id
      WHERE so.id = ?
    `, [id]);

    if (designs.length === 0) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const design = designs[0];
    const formattedDesign = {
      ...design,
      rootCardId: design.id,
      details: typeof design.details === 'string' ? JSON.parse(design.details) : design.details || {},
      documents: typeof design.documents === 'string' ? JSON.parse(design.documents) : design.documents || [],
      bomData: typeof design.bomData === 'string' ? JSON.parse(design.bomData) : design.bomData || [],
      drawings3D: typeof design.drawings3D === 'string' ? JSON.parse(design.drawings3D) : design.drawings3D || []
    };

    res.json({
      success: true,
      design: formattedDesign
    });
  } catch (error) {
    console.error('Get design by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createDesignProject = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { rootCardId, designName, designType, designCategory, priority, additionalNotes } = req.body;

    if (!rootCardId) {
      return res.status(400).json({ message: 'Root Card ID is required' });
    }

    // Process uploaded files if any
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map(file => ({
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: file.originalname,
        path: `/uploads/design-engineering/${file.filename}`,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date().toISOString()
      }));
    }

    // Check if design detail already exists
    const [existing] = await connection.execute(
      'SELECT id, documents FROM design_engineering_details WHERE sales_order_id = ?',
      [rootCardId]
    );

    if (existing.length > 0) {
      // Merge documents if needed, or replace. Here we replace for simplicity as per "New Design" intent
      // But let's append for safety
      let existingDocs = [];
      try {
        existingDocs = typeof existing[0].documents === 'string' ? JSON.parse(existing[0].documents) : (existing[0].documents || []);
      } catch (e) {
        existingDocs = [];
      }
      
      const allDocs = [...existingDocs, ...documents];

      await connection.execute(
        `UPDATE design_engineering_details 
         SET design_status = 'draft', design_notes = ?, 
             specifications = JSON_SET(COALESCE(specifications, '{}'), '$.designName', ?, '$.designType', ?, '$.designCategory', ?, '$.priority', ?), 
             documents = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE sales_order_id = ?`,
        [additionalNotes || '', designName || '', designType || 'New Design', designCategory || 'Part', priority || 'Normal', JSON.stringify(allDocs), rootCardId]
      );
    } else {
      const specifications = JSON.stringify({
        designName: designName || '',
        designType: designType || 'New Design',
        designCategory: designCategory || 'Part',
        priority: priority || 'Normal'
      });

      await connection.execute(
        `INSERT INTO design_engineering_details 
         (sales_order_id, documents, design_status, design_notes, specifications)
         VALUES (?, ?, 'draft', ?, ?)`,
        [rootCardId, JSON.stringify(documents), additionalNotes || '', specifications]
      );
    }

    // Update workflow step 2 (Design) to in_progress
    await connection.execute(
      `UPDATE sales_order_workflow_steps 
       SET status = 'in_progress', started_at = COALESCE(started_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP 
       WHERE sales_order_id = ? AND step_number = 2`,
      [rootCardId]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: 'Design project created/updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Create design project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.updateDesignStatus = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const [updated] = await connection.execute(
      'UPDATE design_engineering_details SET design_status = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?',
      [status, id]
    );

    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: 'Design details not found' });
    }

    await connection.commit();
    res.json({ success: true, message: `Design status updated to ${status}` });
  } catch (error) {
    await connection.rollback();
    console.error('Update design status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.deleteDesignProject = async (req, res) => {
  try {
    const { id } = req.params;
    // We don't actually delete the SO, just clear the design details if needed
    // or we can delete the design_engineering_details record
    await pool.execute('DELETE FROM design_engineering_details WHERE sales_order_id = ?', [id]);
    res.json({ success: true, message: 'Design details deleted' });
  } catch (error) {
    console.error('Delete design project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.downloadDesignDocument = async (req, res) => {
  try {
    const { id } = req.params; // sales_order_id
    const { documentId } = req.query;

    const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
    const documents = await DesignEngineeringDetail.getDocuments(id);

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: 'No documents found for this design' });
    }

    let document;
    if (documentId) {
      document = documents.find(doc => String(doc.id) === String(documentId));
    } else {
      // Default to first document if no documentId provided
      document = documents[0];
    }

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const fs = require('fs');
    const path = require('path');
    
    // Check various possible path locations
    let filePath = document.path;
    if (!fs.existsSync(filePath)) {
      // Try relative to project root
      filePath = path.join(process.cwd(), document.path);
    }
    
    if (!fs.existsSync(filePath)) {
      // Try in uploads/root-cards/documents
      filePath = path.join(process.cwd(), 'backend', 'uploads', 'root-cards', 'documents', path.basename(document.path));
    }

    if (!fs.existsSync(filePath)) {
      console.error('File not found at:', filePath, 'Original path:', document.path);
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, document.name);
  } catch (error) {
    console.error('Download design document error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
