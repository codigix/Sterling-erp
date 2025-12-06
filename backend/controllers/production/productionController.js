const pool = require('../../config/database');
const RootCard = require('../../models/RootCard');

exports.getRootCards = async (req, res) => {
  try {
    const { status, projectId, search } = req.query;
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

      res.json({
        ...rootCard,
        stages: stages || []
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

    const rootCardId = await RootCard.create({
      projectId,
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
      await connection.execute(`
        UPDATE root_cards
        SET title = ?, status = ?, priority = ?, planned_start = ?, planned_end = ?, assigned_supervisor = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
      `, [title, status, priority, plannedStart, plannedEnd, assignedSupervisor, notes, id]);

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
