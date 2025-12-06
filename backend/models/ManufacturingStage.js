const pool = require('../config/database');

class ManufacturingStage {
  static async createMany(stages, externalConnection = null) {
    if (!Array.isArray(stages) || !stages.length) {
      return;
    }

    const connection = externalConnection || (await pool.getConnection());

    try {
      const placeholders = stages.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = [];

      stages.forEach((stage) => {
        values.push(
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
          stage.notes || null
        );
      });

      await connection.execute(
        `
          INSERT INTO manufacturing_stages
          (root_card_id, stage_name, stage_type, status, assigned_worker, planned_start, planned_end, start_date, end_date, progress, notes)
          VALUES ${placeholders}
        `,
        values
      );

      if (!externalConnection) {
        connection.release();
      }
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
}

module.exports = ManufacturingStage;
