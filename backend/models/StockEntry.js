const pool = require('../config/database');

class StockEntry {
  static async create(data) {
    const entryDate = new Date();
    const entryNo = `SE-${entryDate.getFullYear()}${String(entryDate.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const [result] = await pool.execute(
      `INSERT INTO stock_entries (
        grn_id, entry_no, entry_date, entry_type, 
        from_warehouse, to_warehouse, remarks, items, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.grn_id || null,
        data.entry_no || entryNo,
        data.entry_date,
        data.entry_type,
        data.from_warehouse || null,
        data.to_warehouse || null,
        data.remarks || null,
        JSON.stringify(data.items || []),
        data.status || 'submitted'
      ]
    );
    return result.insertId;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM stock_entries WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.type) {
      query += ' AND entry_type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return (rows || []).map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
    }));
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM stock_entries WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return {
      ...rows[0],
      items: typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items
    };
  }

  static async findByGrnId(grnId) {
    const [rows] = await pool.execute('SELECT * FROM stock_entries WHERE grn_id = ?', [grnId]);
    if (rows.length === 0) return null;
    return {
      ...rows[0],
      items: typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items
    };
  }
}

module.exports = StockEntry;
