const pool = require('../config/database');

const parseJson = (value, fallback = {}) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

class SalesOrderDraft {
  static formatRow(row) {
    if (!row) return null;
    return {
      ...row,
      formData: parseJson(row.form_data, {}),
      poDocuments: parseJson(row.po_documents, []),
    };
  }

  static async findLatest(userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_drafts WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );
    return SalesOrderDraft.formatRow(rows[0]);
  }

  static async findById(id, userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_drafts WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return SalesOrderDraft.formatRow(rows[0]);
  }

  static async create(userId, data) {
    const [result] = await pool.execute(
      `INSERT INTO sales_order_drafts (user_id, form_data, current_step, po_documents, last_saved) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, JSON.stringify(data.formData || {}), data.currentStep || 1, JSON.stringify(data.poDocuments || [])]
    );
    return result.insertId;
  }

  static async update(id, userId, data) {
    await pool.execute(
      `UPDATE sales_order_drafts SET form_data = ?, current_step = ?, po_documents = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [JSON.stringify(data.formData || {}), data.currentStep || 1, JSON.stringify(data.poDocuments || []), id, userId]
    );
  }

  static async delete(id, userId) {
    await pool.execute(
      `DELETE FROM sales_order_drafts WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
  }
}

module.exports = SalesOrderDraft;
