const pool = require('../config/database');

class ManufacturingStage {
  static async createMany(stages, externalConnection = null) {
    if (!Array.isArray(stages) || !stages.length) {
      return [];
    }

    const connection = externalConnection || (await pool.getConnection());
    const createdStages = [];

    try {
      for (const stage of stages) {
        const [result] = await connection.execute(
          `
            INSERT INTO manufacturing_stages
            (root_card_id, stage_name, stage_type, status, assigned_worker, planned_start, planned_end, start_date, end_date, progress, target_warehouse, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            stage.rootCardId,
            stage.stageName,
            stage.stageType || 'in_house',
            stage.status || 'pending',
            stage.assignedWorker || null,
            stage.plannedStart || null,
            stage.plannedEnd || null,
            stage.startDate || null,
            stage.endDate || null,
            stage.progress ?? 0,
            stage.targetWarehouse || null,
            stage.notes || null
          ]
        );
        
        createdStages.push({
          id: result.insertId,
          ...stage
        });
      }

      if (!externalConnection) {
        connection.release();
      }
      
      return createdStages;
    } catch (error) {
      if (!externalConnection) {
        connection.release();
      }
      throw error;
    }
  }

  static async findByRootCardIds(rootCardIds, filters = {}) {
    if (!Array.isArray(rootCardIds) || !rootCardIds.length) {
      return [];
    }

    const placeholders = rootCardIds.map(() => '?').join(', ');
    const params = [...rootCardIds];
    let query = `
      SELECT ms.*, u.id AS worker_id, u.username AS worker_username, u.email AS worker_email
      FROM manufacturing_stages ms
      LEFT JOIN users u ON u.id = ms.assigned_worker
      WHERE ms.root_card_id IN (${placeholders})
    `;

    if (filters.assignedTo) {
      query += ' AND ms.assigned_worker = ?';
      params.push(filters.assignedTo);
    }

    query += ' ORDER BY ms.created_at ASC';

    const [rows] = await pool.execute(query, params);
    return rows.map((row) => ({
      ...row,
      worker: row.worker_id
        ? {
            id: row.worker_id,
            username: row.worker_username,
            email: row.worker_email
          }
        : null
    }));
  }

  static async getCountsByRootCard(rootCardIds) {
    if (!Array.isArray(rootCardIds) || !rootCardIds.length) {
      return [];
    }

    const placeholders = rootCardIds.map(() => '?').join(', ');
    const [rows] = await pool.execute(
      `
        SELECT root_card_id,
          COUNT(*) AS total_stages,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_stages,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_stages
        FROM manufacturing_stages
        WHERE root_card_id IN (${placeholders})
        GROUP BY root_card_id
      `,
      rootCardIds
    );
    return rows;
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    if (data.stageName !== undefined) {
      updates.push('stage_name = ?');
      params.push(data.stageName);
    }
    if (data.stageType !== undefined) {
      updates.push('stage_type = ?');
      params.push(data.stageType);
    }
    if (data.assignedWorker !== undefined) {
      updates.push('assigned_worker = ?');
      params.push(data.assignedWorker);
    }
    if (data.plannedStart !== undefined) {
      updates.push('planned_start = ?');
      params.push(data.plannedStart);
    }
    if (data.plannedEnd !== undefined) {
      updates.push('planned_end = ?');
      params.push(data.plannedEnd);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.targetWarehouse !== undefined) {
      updates.push('target_warehouse = ?');
      params.push(data.targetWarehouse);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    if (updates.length === 0) {
      return;
    }

    params.push(id);

    await pool.execute(
      `UPDATE manufacturing_stages SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ms.*, u.id AS worker_id, u.username AS worker_username, u.email AS worker_email
       FROM manufacturing_stages ms
       LEFT JOIN users u ON u.id = ms.assigned_worker
       WHERE ms.id = ?`,
      [id]
    );
    
    if (!rows.length) return null;

    const row = rows[0];
    return {
      ...row,
      worker: row.worker_id
        ? {
            id: row.worker_id,
            username: row.worker_username,
            email: row.worker_email
          }
        : null
    };
  }
}

module.exports = ManufacturingStage;
