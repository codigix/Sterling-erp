const pool = require('../config/database');

const parseJson = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

class RootCard {
  static formatRow(row) {
    if (!row) {
      return null;
    }
    return {
      ...row,
      stages: parseJson(row.stages, [])
    };
  }

  static async findAll(filters = {}) {
    const params = [];
    const conditions = [];
    let query = `
      SELECT rc.*, p.name AS project_name, p.code AS project_code, p.client_name, so.customer AS customer_name
      FROM root_cards rc
      INNER JOIN projects p ON p.id = rc.project_id
      LEFT JOIN sales_orders so ON so.id = p.sales_order_id
    `;

    if (filters.assignedTo) {
      query += `
        INNER JOIN manufacturing_stages ms_filter ON ms_filter.root_card_id = rc.id AND ms_filter.assigned_worker = ?
      `;
      params.push(filters.assignedTo);
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push('rc.status = ?');
      params.push(filters.status);
    }

    if (filters.projectId) {
      conditions.push('rc.project_id = ?');
      params.push(filters.projectId);
    }

    if (filters.search) {
      conditions.push('(rc.title LIKE ? OR p.name LIKE ? OR so.po_number LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY rc.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows.map(RootCard.formatRow);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `
        SELECT rc.*, p.name AS project_name, p.code AS project_code, p.client_name, so.customer AS customer_name
        FROM root_cards rc
        INNER JOIN projects p ON p.id = rc.project_id
        LEFT JOIN sales_orders so ON so.id = p.sales_order_id
        WHERE rc.id = ?
      `,
      [id]
    );
    return RootCard.formatRow(rows[0]);
  }

  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());

    try {
      const [result] = await connection.execute(
        `
          INSERT INTO root_cards
          (project_id, code, title, status, priority, planned_start, planned_end, created_by, assigned_supervisor, notes, stages)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.projectId,
          data.code || null,
          data.title,
          data.status || 'planning',
          data.priority || 'medium',
          data.plannedStart || null,
          data.plannedEnd || null,
          data.createdBy || null,
          data.assignedSupervisor || null,
          data.notes || null,
          JSON.stringify(data.stages || [])
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
}

module.exports = RootCard;
