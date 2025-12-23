const pool = require('../../config/database');
const RootCard = require('../../models/RootCard');
const DesignEngineeringDetail = require('../../models/DesignEngineeringDetail');
const DepartmentTask = require('../../models/DepartmentTask');
const DesignWorkflowStep = require('../../models/DesignWorkflowStep');
const DesignProjectDetails = require('../../models/DesignProjectDetails');

exports.getRootCards = async (req, res) => {
  try {
    const { status, projectId, search, salesOrderId } = req.query;
    
    if (salesOrderId) {
      const rootCard = await RootCard.findBySalesOrderId(salesOrderId);
      return res.json(rootCard ? [rootCard] : []);
    }

    const filters = {};
    
    if (status) filters.status = status;
    if (projectId) filters.projectId = projectId;
    if (search) filters.search = search;

    const rootCards = await RootCard.findAll(filters);
    res.json({ rootCards, total: rootCards.length });
  } catch (error) {
    console.error('Get root cards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRootCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const rootCard = await RootCard.findById(id);
    
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
          designEngineeringDetails = await DesignEngineeringDetail.findBySalesOrderId(projects[0].sales_order_id);
        }
      }

      res.json({
        ...rootCard,
        stages: stages || [],
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

exports.createRootCard = async (req, res) => {
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
    const salesOrderId = projects.length > 0 ? projects[0].sales_order_id : null;

    const rootCardId = await RootCard.create({
      projectId,
      salesOrderId,
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
          (root_card_id, stage_name, stage_type, status, planned_start, planned_end, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          rootCardId,
          stage.stageName,
          stage.stageType || 'in_house',
          stage.status || 'pending',
          stage.plannedStart || null,
          stage.plannedEnd || null,
          stage.notes || null
        ]);
      }
    }

    await connection.commit();

    res.status(201).json({
      message: 'Root card created successfully',
      rootCardId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create root card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.updateRootCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, priority, plannedStart, plannedEnd, assignedSupervisor, notes } = req.body;

    const connection = await pool.getConnection();
    try {
      const [existingCard] = await connection.execute('SELECT status FROM root_cards WHERE id = ?', [id]);
      const oldStatus = existingCard[0]?.status;
      const statusChanged = oldStatus && oldStatus !== status;

      await connection.execute(`
        UPDATE root_cards
        SET title = ?, status = ?, priority = ?, planned_start = ?, planned_end = ?, assigned_supervisor = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
      `, [title, status, priority, plannedStart, plannedEnd, assignedSupervisor, notes, id]);

      if (statusChanged && status === 'in_progress') {
        const [designRoles] = await connection.execute(
          'SELECT id FROM roles WHERE name LIKE ? LIMIT 1',
          ['%design%']
        );

        if (designRoles && designRoles.length > 0) {
          const roleId = designRoles[0].id;
          const [rootCard] = await connection.execute(
            'SELECT title FROM root_cards WHERE id = ?',
            [id]
          );
          const taskTitle = `Design Review - ${rootCard[0].title}`;

          await connection.execute(`
            INSERT INTO department_tasks (root_card_id, role_id, task_title, task_description, status, priority, assigned_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            id,
            roleId,
            taskTitle,
            `Review and validate design for root card: ${rootCard[0].title}`,
            'pending',
            priority || 'medium',
            req.user?.id || null
          ]);
        }
      }

      res.json({ message: 'Root card updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update root card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteRootCard = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    await connection.execute('DELETE FROM worker_tasks WHERE stage_id IN (SELECT id FROM manufacturing_stages WHERE root_card_id = ?)', [id]);
    await connection.execute('DELETE FROM manufacturing_stages WHERE root_card_id = ?', [id]);
    await connection.execute('DELETE FROM root_cards WHERE id = ?', [id]);

    await connection.commit();

    res.json({ message: 'Root card deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete root card error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

exports.getManufacturingStages = async (req, res) => {
  try {
    const { rootCardId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [stages] = await connection.execute(`
        SELECT id, stage_name, stage_type, status, assigned_worker, planned_start, planned_end, progress, notes
        FROM manufacturing_stages
        WHERE root_card_id = ?
        ORDER BY id ASC
      `, [rootCardId]);

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
    const { rootCardId, stageName, stageType, plannedStart, plannedEnd, notes } = req.body;

    if (!rootCardId || !stageName) {
      return res.status(400).json({ message: 'Root card ID and stage name are required' });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO manufacturing_stages
        (root_card_id, stage_name, stage_type, status, planned_start, planned_end, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        rootCardId,
        stageName,
        stageType || 'in_house',
        'pending',
        plannedStart || null,
        plannedEnd || null,
        notes || null
      ]);

      res.status(201).json({
        message: 'Manufacturing stage created successfully',
        stageId: result.insertId
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
    const { stageName, stageType, plannedStart, plannedEnd, assignedWorker, notes } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        UPDATE manufacturing_stages
        SET stage_name = ?, stage_type = ?, planned_start = ?, planned_end = ?, assigned_worker = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
      `, [stageName, stageType, plannedStart, plannedEnd, assignedWorker, notes, id]);

      res.json({ message: 'Manufacturing stage updated successfully' });
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
    const { status, progress } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const connection = await pool.getConnection();
    try {
      const updateFields = ['status = ?'];
      const params = [status];

      if (progress !== undefined) {
        updateFields.push('progress = ?');
        params.push(progress);
      }

      if (status === 'completed') {
        updateFields.push('end_date = NOW()');
      } else if (status === 'in_progress') {
        updateFields.push('start_date = COALESCE(start_date, NOW())');
      }

      params.push(id);

      await connection.execute(`
        UPDATE manufacturing_stages
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = ?
      `, params);

      res.json({ message: 'Stage status updated successfully' });
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
      const [tasks] = await connection.execute(`
        SELECT id, worker_id, task, status, logs, created_at
        FROM worker_tasks
        WHERE stage_id = ?
        ORDER BY created_at DESC
      `, [stageId]);

      res.json({ tasks, total: tasks.length });
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
    const { stageId, workerId, task } = req.body;

    if (!stageId || !workerId || !task) {
      return res.status(400).json({ message: 'Stage ID, worker ID, and task are required' });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        INSERT INTO worker_tasks
        (stage_id, worker_id, task, status)
        VALUES (?, ?, ?, ?)
      `, [stageId, workerId, task, 'pending']);

      res.status(201).json({
        message: 'Worker task created successfully',
        taskId: result.insertId
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
    const { status, logs } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        UPDATE worker_tasks
        SET status = ?, logs = COALESCE(?, logs)
        WHERE id = ?
      `, [status, logs ? JSON.stringify(logs) : null, id]);

      res.json({ message: 'Task status updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.autoGenerateDesignTasks = async (req, res) => {
  try {
    const { rootCardId } = req.params;
    console.log('Starting auto-generate tasks for root card:', rootCardId);

    const rootCard = await RootCard.findById(rootCardId);
    console.log('Root card found:', rootCard);
    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    let designEngineering = null;
    let salesOrderId = rootCard.sales_order_id;

    if (rootCard.project_id) {
      console.log('Fetching design engineering for project:', rootCard.project_id);
      const connection = await pool.getConnection();
      try {
        const [projects] = await connection.execute(`
          SELECT sales_order_id FROM projects WHERE id = ?
        `, [rootCard.project_id]);
        console.log('Project data:', projects);

        if (projects.length > 0 && projects[0].sales_order_id) {
          salesOrderId = projects[0].sales_order_id;
          console.log('Fetching design engineering for sales order:', projects[0].sales_order_id);
          designEngineering = await DesignEngineeringDetail.findBySalesOrderId(projects[0].sales_order_id);
          console.log('Design engineering data:', designEngineering);
        }
      } finally {
        connection.release();
      }
    }

    if (!designEngineering) {
      console.log('No design engineering details found');
      return res.status(400).json({ message: 'No design engineering details found' });
    }

    const connection = await pool.getConnection();
    try {
      const [designRole] = await connection.execute(
        'SELECT id FROM roles WHERE name LIKE ? LIMIT 1',
        ['%design%']
      );
      console.log('Design role result:', designRole);

      if (!designRole || designRole.length === 0) {
        return res.status(400).json({ message: 'Design engineer role not found' });
      }

      const roleId = designRole[0].id;
      const tasksToCreate = [];

      if (designEngineering.bomData && typeof designEngineering.bomData === 'object' && Object.keys(designEngineering.bomData).length > 0) {
        tasksToCreate.push({
          root_card_id: rootCardId,
          role_id: roleId,
          task_title: `Analyze Bill of Materials - ${rootCard.title}`,
          task_description: `Review and analyze BOM data for ${rootCard.title}. Ensure all components are available and specifications match design requirements.`,
          priority: 'high',
          status: 'pending'
        });
      }

      if (Array.isArray(designEngineering.drawings3D) && designEngineering.drawings3D.length > 0) {
        tasksToCreate.push({
          root_card_id: rootCardId,
          role_id: roleId,
          task_title: `Review 3D Design Drawings - ${rootCard.title}`,
          task_description: `Review and validate 3D drawings and CAD files. Check dimensions, tolerances, and manufacturing feasibility.`,
          priority: 'high',
          status: 'pending'
        });
      }

      if (designEngineering.specifications && typeof designEngineering.specifications === 'object' && Object.keys(designEngineering.specifications).length > 0) {
        tasksToCreate.push({
          root_card_id: rootCardId,
          role_id: roleId,
          task_title: `Validate Design Specifications - ${rootCard.title}`,
          task_description: `Validate all design specifications including materials, dimensions, tolerances, and quality standards.`,
          priority: 'medium',
          status: 'pending'
        });
      }

      if (Array.isArray(designEngineering.documents) && designEngineering.documents.length > 0) {
        tasksToCreate.push({
          root_card_id: rootCardId,
          role_id: roleId,
          task_title: `Review Design Documentation - ${rootCard.title}`,
          task_description: `Review all uploaded design documents and ensure completeness. Check for any missing specifications or requirements.`,
          priority: 'medium',
          status: 'pending'
        });
      }

      if (designEngineering.designNotes) {
        tasksToCreate.push({
          root_card_id: rootCardId,
          role_id: roleId,
          task_title: `Review Design Notes & Requirements - ${rootCard.title}`,
          task_description: `Review design notes: ${designEngineering.designNotes.substring(0, 200)}...`,
          priority: 'medium',
          status: 'pending'
        });
      }

      console.log('Tasks to create:', tasksToCreate);
      if (tasksToCreate.length === 0) {
        return res.status(400).json({ message: 'No design data available to create tasks' });
      }

      const createdTasks = [];
      let assignedBy = null;
      if (req.user?.id) {
        const parsed = parseInt(req.user.id);
        assignedBy = !isNaN(parsed) ? parsed : null;
      }
      console.log('assigned_by value:', assignedBy, 'type:', typeof assignedBy);
      
      for (const taskData of tasksToCreate) {
        try {
          console.log('Creating task:', taskData);
          
          const existingTask = await DepartmentTask.findByRootCardAndTitle(rootCardId, taskData.task_title);
          if (existingTask) {
            console.log('Task already exists:', taskData.task_title);
            continue;
          }
          
          const result = await DepartmentTask.createDepartmentTask({
            root_card_id: taskData.root_card_id,
            role_id: taskData.role_id,
            task_title: taskData.task_title,
            task_description: taskData.task_description,
            priority: taskData.priority,
            status: taskData.status,
            assigned_by: assignedBy,
            sales_order_id: salesOrderId || null
          });
          console.log('Task creation result:', result);

          if (result.insertId) {
            createdTasks.push({
              id: result.insertId,
              title: taskData.task_title,
              description: taskData.task_description,
              priority: taskData.priority,
              status: taskData.status
            });
          }
        } catch (taskError) {
          console.error('Error creating individual task:', taskError);
          throw taskError;
        }
      }

      res.status(201).json({
        message: `Successfully created ${createdTasks.length} design tasks`,
        tasks: createdTasks,
        totalCreated: createdTasks.length
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Auto-generate design tasks error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.createWorkflowBasedTasks = async (req, res) => {
  try {
    const { rootCardId } = req.params;
    console.log('Creating workflow-based tasks for root card or sales order:', rootCardId);

    let rootCard = await RootCard.findById(rootCardId);
    
    if (!rootCard) {
      console.log('Root card not found by ID, trying as sales order ID');
      rootCard = await RootCard.findBySalesOrderId(rootCardId);
      
      if (!rootCard) {
        console.log('Root card not found by sales order ID either, attempting to create');
        const connection = await pool.getConnection();
        try {
          const SalesOrder = require('../../models/SalesOrder');
          const Project = require('../../models/Project');
          
          console.log('Fetching sales order with ID:', rootCardId);
          const salesOrder = await SalesOrder.findById(rootCardId);
          if (!salesOrder) {
            connection.release();
            console.warn('Sales order not found with ID:', rootCardId);
            return res.status(404).json({ message: 'Sales order not found' });
          }
          
          console.log('Sales order found:', { id: salesOrder.id, po_number: salesOrder.po_number, customer: salesOrder.customer });
          
          await connection.beginTransaction();
          
          let projectId;
          const [existingProjects] = await connection.execute(
            'SELECT id FROM projects WHERE sales_order_id = ? LIMIT 1',
            [rootCardId]
          );
          
          if (existingProjects && existingProjects.length > 0) {
            console.log('Project already exists for sales order:', rootCardId);
            projectId = existingProjects[0].id;
          } else {
            const projectCode = `PRJ-${salesOrder.po_number}-${Date.now()}`;
            const projectCreateData = {
              name: salesOrder.project_name || `Project for ${salesOrder.customer}`,
              code: projectCode,
              salesOrderId: rootCardId,
              clientName: salesOrder.customer,
              poNumber: salesOrder.po_number,
              status: 'draft',
              priority: salesOrder.priority || 'medium',
              expectedStart: salesOrder.order_date,
              expectedEnd: salesOrder.due_date,
              managerId: null,
              summary: salesOrder.notes
            };
            
            console.log('Creating project with data:', projectCreateData);
            projectId = await Project.create(projectCreateData, connection);
            console.log('Project created with ID:', projectId);
          }
          
          const [existingRootCards] = await connection.execute(
            'SELECT id FROM root_cards WHERE project_id = ? LIMIT 1',
            [projectId]
          );
          
          let rootCardId_new;
          if (existingRootCards && existingRootCards.length > 0) {
            console.log('Root card already exists for project:', projectId);
            rootCardId_new = existingRootCards[0].id;
          } else {
            const projectCode = `PRJ-${salesOrder.po_number}-${Date.now()}`;
            const rootCardCreateData = {
              projectId,
              salesOrderId: rootCardId,
              code: projectCode,
              title: salesOrder.project_name || `Root Card for ${salesOrder.customer}`,
              status: 'planning',
              priority: salesOrder.priority || 'medium',
              plannedStart: salesOrder.order_date,
              plannedEnd: salesOrder.due_date,
              createdBy: null,
              notes: `Auto-created from Sales Order ${salesOrder.po_number}`,
              stages: []
            };
            
            console.log('Creating root card with data:', rootCardCreateData);
            rootCardId_new = await RootCard.create(rootCardCreateData, connection);
            console.log('Root card created with ID:', rootCardId_new);
          }
          
          await connection.commit();
          console.log('Transaction committed');
          
          rootCard = await RootCard.findById(rootCardId_new);
          console.log('Root card loaded successfully:', rootCard?.id);
        } catch (createError) {
          console.error('Error creating root card:', createError.message);
          console.error('Error details:', {
            code: createError.code,
            sqlState: createError.sqlState,
            errno: createError.errno,
            sql: createError.sql
          });
          try {
            await connection.rollback();
            console.log('Transaction rolled back');
          } catch (rollbackErr) {
            console.error('Rollback failed:', rollbackErr.message);
          }
          connection.release();
          return res.status(500).json({ 
            message: 'Could not create root card for sales order', 
            error: createError.message,
            details: createError.code 
          });
        }
      }
    }

    const connection = await pool.getConnection();
    try {
      const [designRole] = await connection.execute(
        'SELECT id FROM roles WHERE name LIKE ? LIMIT 1',
        ['%design%']
      );

      if (!designRole || designRole.length === 0) {
        return res.status(400).json({ message: 'Design engineer role not found' });
      }

      const roleId = designRole[0].id;
      const workflowSteps = await DesignWorkflowStep.getAllSteps();
      console.log('Found workflow steps:', workflowSteps.length);

      let salesOrderId = rootCard.sales_order_id;
      if (!salesOrderId && rootCard.project_id) {
        const [projectRows] = await connection.execute(
          'SELECT sales_order_id FROM projects WHERE id = ?',
          [rootCard.project_id]
        );
        if (projectRows.length > 0) {
          salesOrderId = projectRows[0].sales_order_id;
        }
      }

      // Fallback: Use the salesOrderId passed in params (which is rootCardId in this context)
      if (!salesOrderId) {
        console.log('Using fallback salesOrderId from params:', rootCardId);
        salesOrderId = parseInt(rootCardId);
      }

      console.log('Using sales_order_id for tasks:', salesOrderId);

      const createdTasks = [];
      for (const step of workflowSteps) {
        const existingTask = await DepartmentTask.findByRootCardAndTitle(
          rootCard.id,
          step.task_template_title
        );

        if (existingTask) {
          console.log('Task already exists for step:', step.step_name);
          continue;
        }

        const result = await DepartmentTask.createDepartmentTask({
          root_card_id: rootCard.id,
          role_id: roleId,
          task_title: step.task_template_title,
          task_description: step.task_template_description,
          priority: step.priority,
          status: 'draft',
          assigned_by: null,
          sales_order_id: salesOrderId || null,
          notes: JSON.stringify({
            workflow_step: step.step_name,
            step_order: step.step_order,
            trigger: step.auto_create_on_trigger,
            step_id: step.id
          })
        });

        if (result.insertId) {
          createdTasks.push({
            id: result.insertId,
            title: step.task_template_title,
            description: step.task_template_description,
            priority: step.priority,
            status: 'draft',
            workflowStep: step.step_name,
            stepOrder: step.step_order
          });
        }
      }

      res.status(201).json({
        message: `Successfully created ${createdTasks.length} workflow-based design tasks`,
        tasks: createdTasks,
        totalCreated: createdTasks.length,
        workflowSteps: workflowSteps.length
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create workflow tasks error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getProductionStatistics = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [stats] = await connection.execute(`
        SELECT
          (SELECT COUNT(*) FROM root_cards) as total_root_cards,
          (SELECT COUNT(*) FROM root_cards WHERE status = 'completed') as completed_root_cards,
          (SELECT COUNT(*) FROM root_cards WHERE status = 'in_progress') as in_progress_root_cards,
          (SELECT COUNT(*) FROM root_cards WHERE status = 'on_hold') as on_hold_root_cards,
          (SELECT COUNT(*) FROM manufacturing_stages) as total_stages,
          (SELECT COUNT(*) FROM manufacturing_stages WHERE status = 'completed') as completed_stages,
          (SELECT COUNT(*) FROM worker_tasks) as total_tasks,
          (SELECT COUNT(*) FROM worker_tasks WHERE status = 'completed') as completed_tasks
      `);

      res.json(stats[0] || {});
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get production statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.saveDesignProjectDetails = async (req, res) => {
  try {
    const { rootCardId } = req.params;
    const projectData = req.body;

    console.log('Saving design details for rootCardId:', rootCardId);
    console.log('Materials data:', {
      steelSections: projectData.steelSections,
      plates: projectData.plates,
      fasteners: projectData.fasteners,
      components: projectData.components,
      electrical: projectData.electrical,
      consumables: projectData.consumables
    });

    const rootCard = await RootCard.findById(rootCardId);
    if (!rootCard) {
      return res.status(404).json({ message: 'Root card not found' });
    }

    await DesignProjectDetails.createOrUpdate(rootCardId, {
      designId: projectData.designId,
      projectName: projectData.projectName,
      productName: projectData.productName,
      designStatus: projectData.designStatus,
      designEngineerName: projectData.designEngineerName,
      systemLength: projectData.systemLength,
      systemWidth: projectData.systemWidth,
      systemHeight: projectData.systemHeight,
      loadCapacity: projectData.loadCapacity,
      operatingEnvironment: projectData.operatingEnvironment,
      materialGrade: projectData.materialGrade,
      surfaceFinish: projectData.surfaceFinish,
      steelSections: projectData.steelSections,
      plates: projectData.plates,
      fasteners: projectData.fasteners,
      components: projectData.components,
      electrical: projectData.electrical,
      consumables: projectData.consumables,
      designSpecifications: projectData.designSpecifications,
      manufacturingInstructions: projectData.manufacturingInstructions,
      qualitySafety: projectData.qualitySafety,
      additionalNotes: projectData.additionalNotes,
      referenceDocuments: projectData.uploadedFiles?.references
    });

    res.status(201).json({
      message: 'Design project details saved successfully',
      rootCardId: rootCardId
    });
  } catch (error) {
    console.error('Save design project details error:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getDesignProjectDetails = async (req, res) => {
  try {
    const { rootCardId } = req.params;

    const details = await DesignProjectDetails.findByRootCardId(rootCardId);
    
    console.log('Retrieved design details for rootCardId:', rootCardId);
    console.log('Details:', details);
    
    res.json({
      data: details,
      message: details ? 'Design project details found' : 'No design project details found'
    });
  } catch (error) {
    console.error('Get design project details error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createDesignProject = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const projectData = req.body;

    if (!projectData.productName) {
      return res.status(400).json({ message: 'Product Name is required' });
    }

    // Find or create project
    let projectId;
    if (projectData.salesOrderId) {
      const [existingProjects] = await connection.execute(
        'SELECT id FROM projects WHERE sales_order_id = ?',
        [projectData.salesOrderId]
      );
      
      if (existingProjects.length > 0) {
        projectId = existingProjects[0].id;
      } else {
        // Create new project linked to sales order
        const [result] = await connection.execute(
          'INSERT INTO projects (name, sales_order_id, status, code) VALUES (?, ?, ?, ?)',
          [
            projectData.projectName, 
            projectData.salesOrderId, 
            'planning',
            `PRJ-${Date.now()}` // Generate a project code
          ]
        );
        projectId = result.insertId;
      }
    } else {
      // Fallback: try to find by name or create standalone project
      const [existingProjects] = await connection.execute(
        'SELECT id FROM projects WHERE name = ?',
        [projectData.projectName]
      );
      
      if (existingProjects.length > 0) {
        projectId = existingProjects[0].id;
      } else {
        const [result] = await connection.execute(
          'INSERT INTO projects (name, status, code) VALUES (?, ?, ?)',
          [
            projectData.projectName, 
            'planning',
            `PRJ-${Date.now()}`
          ]
        );
        projectId = result.insertId;
      }
    }

    const rootCardId = await RootCard.create({
      projectId: projectId,
      salesOrderId: projectData.salesOrderId || null,
      code: projectData.designId || `DES-${Date.now()}`,
      title: projectData.designName || projectData.productName,
      status: projectData.designStatus || 'planning',
      priority: 'medium',
      createdBy: req.user.id === 'demo' ? 1 : req.user.id, // Handle demo user ID
      assignedSupervisor: null, // 'Current User' string causes DB error, set to null for now
      notes: projectData.additionalNotes
    }, connection);

    console.log('Created root card with ID:', rootCardId);

    await DesignProjectDetails.create(rootCardId, {
      designId: projectData.designId || `DES-${Date.now()}`,
      // designName: projectData.designName || projectData.productName, // Removed as column might not exist
      projectName: projectData.projectName,
      productName: projectData.productName,
      designStatus: projectData.designStatus,
      designEngineerName: projectData.designEngineerName,
      systemLength: projectData.systemLength,
      systemWidth: projectData.systemWidth,
      systemHeight: projectData.systemHeight,
      loadCapacity: projectData.loadCapacity,
      operatingEnvironment: projectData.operatingEnvironment,
      materialGrade: projectData.materialGrade,
      surfaceFinish: projectData.surfaceFinish,
      steelSections: projectData.steelSections,
      plates: projectData.plates,
      fasteners: projectData.fasteners,
      components: projectData.components,
      electrical: projectData.electrical,
      consumables: projectData.consumables,
      designSpecifications: projectData.designSpecifications,
      manufacturingInstructions: projectData.manufacturingInstructions,
      qualitySafety: projectData.qualitySafety,
      additionalNotes: projectData.additionalNotes,
      referenceDocuments: projectData.uploadedFiles?.references
    }, connection);

    await connection.commit();

    res.status(201).json({
      message: 'Design project created successfully',
      projectId: rootCardId,
      designId: projectData.designId || `DES-${Date.now()}`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create design project error:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    connection.release();
  }
};

exports.getDesignWithDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const rootCard = await RootCard.findById(id);
    if (!rootCard) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const designDetails = await DesignProjectDetails.findByRootCardId(id);

    const combinedDesign = {
      id: rootCard.id,
      code: rootCard.code,
      title: rootCard.title,
      status: rootCard.status,
      priority: rootCard.priority,
      createdBy: rootCard.created_by,
      assignedSupervisor: rootCard.assigned_supervisor,
      notes: rootCard.notes,
      projectName: rootCard.project_name,
      customerName: rootCard.customer_name,
      projectCode: rootCard.project_code,
      clientName: rootCard.client_name,
      createdAt: rootCard.created_at,
      updatedAt: rootCard.updated_at,
      details: designDetails || {}
    };

    res.json(combinedDesign);
  } catch (error) {
    console.error('Get design with details error:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getAllDesignsWithDetails = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (search) filters.search = search;

    const rootCards = await RootCard.findAll(filters);

    const designs = await Promise.all(
      rootCards.map(async (rootCard) => {
        const designDetails = await DesignProjectDetails.findByRootCardId(rootCard.id);
        return {
          id: rootCard.id,
          code: rootCard.code,
          title: rootCard.title,
          status: rootCard.status,
          priority: rootCard.priority,
          createdBy: rootCard.created_by,
          assignedSupervisor: rootCard.assigned_supervisor,
          projectName: rootCard.project_name,
          customerName: rootCard.customer_name,
          createdAt: rootCard.created_at,
          details: designDetails || {}
        };
      })
    );

    res.json({ designs, total: designs.length });
  } catch (error) {
    console.error('Get all designs with details error:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;
    
    await DesignProjectDetails.delete(id);
    
    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({ message: 'Failed to delete design', error: error.message });
  }
};
