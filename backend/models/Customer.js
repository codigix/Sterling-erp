const pool = require('../config/database');

class Customer {
  static async findAll() {
    const [rows] = await pool.execute(`SELECT * FROM customers WHERE status = 'active' ORDER BY name`);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(`SELECT * FROM customers WHERE id = ?`, [id]);
    return rows[0];
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO customers (name, email, phone, address, gst_number, contact_person, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.email || null,
        data.phone || null,
        data.address || null,
        data.gst_number || null,
        data.contact_person || null,
        data.status || 'active'
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = ['name', 'email', 'phone', 'address', 'gst_number', 'contact_person', 'status'];
    const updates = [];
    const values = [];

    fields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (updates.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE customers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
  }
}

module.exports = Customer;
