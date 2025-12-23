const pool = require('../config/database');

const parseJson = (value, fallback = null) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

class ProductionPlan {
  static async addFinishedGoods(planId, items, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    try {
      // First delete existing items if any (for update scenario)
      await connection.execute('DELETE FROM production_plan_fg WHERE production_plan_id = ?', [planId]);

      if (items && items.length > 0) {
        const values = items.map(item => [planId, item.itemId, item.quantity || 1, item.notes || null]);
        // Flatten the array for the query
        const flattenedValues = values.reduce((acc, val) => acc.concat(val), []);
        const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');

        await connection.execute(
          `INSERT INTO production_plan_fg (production_plan_id, item_id, quantity, notes) VALUES ${placeholders}`,
          flattenedValues
        );
      }

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

  static async getFinishedGoods(planId) {
    const [rows] = await pool.execute(
      `
        SELECT ppfg.*, i.item_name, i.item_code, i.unit
        FROM production_plan_fg ppfg
        JOIN inventory i ON i.id = ppfg.item_id
        WHERE ppfg.production_plan_id = ?
      `,
      [planId]
    );
    return rows;
  }

  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());

    try {
      const [result] = await connection.execute(
        `
          INSERT INTO production_plans
          (project_id, sales_order_id, plan_name, status, start_date, end_date, 
           estimated_completion_date, created_by, assigned_supervisor, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.projectId,
          data.salesOrderId || null,
          data.planName,
          data.status || 'draft',
          data.startDate || null,
          data.endDate || null,
          data.estimatedCompletionDate || null,
          data.createdBy || null,
          data.assignedSupervisor || null,
          data.notes || null
        ]
      );

      if (!externalConnection) {
        connection.release();
      }

      return result.insertId;
    } catch (error) {
      if (!externalConnection) {
        connection.release();
      }
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `
        SELECT pp.*, p.name AS project_name, so.customer AS customer_name, u.username AS created_by_username
        FROM production_plans pp
        LEFT JOIN projects p ON p.id = pp.project_id
        LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
        LEFT JOIN users u ON u.id = pp.created_by
        WHERE pp.id = ?
      `,
      [id]
    );
    return rows[0];
  }

  static async findAll(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.projectId) {
      conditions.push('pp.project_id = ?');
      params.push(filters.projectId);
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push('pp.status = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      conditions.push('pp.plan_name LIKE ? OR p.name LIKE ?');
      const like = `%${filters.search}%`;
      params.push(like, like);
    }

    let query = `
      SELECT pp.*, p.name AS project_name, so.customer AS customer_name, u.username AS created_by_username
      FROM production_plans pp
      LEFT JOIN projects p ON p.id = pp.project_id
      LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
      LEFT JOIN users u ON u.id = pp.created_by
    `;

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY pp.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE production_plans SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
  }

  static async update(id, data) {
    await pool.execute(
      `
        UPDATE production_plans
        SET plan_name = ?, status = ?, start_date = ?, end_date = ?, 
            estimated_completion_date = ?, assigned_supervisor = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        data.planName,
        data.status,
        data.startDate || null,
        data.endDate || null,
        data.estimatedCompletionDate || null,
        data.assignedSupervisor || null,
        data.notes || null,
        id
      ]
    );
  }

  static async updateStageCounts(id, totalStages, completedStages) {
    await pool.execute(
      'UPDATE production_plans SET total_stages = ?, completed_stages = ? WHERE id = ?',
      [totalStages, completedStages, id]
    );
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_plans,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_plans,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_plans,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_plans,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_plans
      FROM production_plans
    `);
    return rows[0];
  }
}

module.exports = ProductionPlan;
