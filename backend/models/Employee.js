const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Employee {
  static async findAll() {
    const [rows] = await pool.execute(`SELECT e.*, r.name as role_name FROM employees e LEFT JOIN roles r ON e.role_id = r.id ORDER BY e.created_at DESC`);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(`SELECT e.*, r.name as role_name FROM employees e LEFT JOIN roles r ON e.role_id = r.id WHERE e.id = ?`, [id]);
    return rows[0];
  }

  static async findByLoginId(loginId) {
    const [rows] = await pool.execute(`SELECT e.*, r.name as role_name FROM employees e LEFT JOIN roles r ON e.role_id = r.id WHERE e.login_id = ?`, [loginId]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(`SELECT e.*, r.name as role_name FROM employees e LEFT JOIN roles r ON e.role_id = r.id WHERE e.email = ?`, [email]);
    return rows[0];
  }

  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [result] = await pool.execute(`INSERT INTO employees (first_name, last_name, email, designation, department, role_id, login_id, password, actions, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.firstName, data.lastName, data.email, data.designation, data.department, data.roleId, data.loginId, hashedPassword, JSON.stringify(data.actions || []), 'active']);
    return result.insertId;
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    if (data.firstName) { updates.push('first_name = ?'); values.push(data.firstName); }
    if (data.lastName) { updates.push('last_name = ?'); values.push(data.lastName); }
    if (data.designation) { updates.push('designation = ?'); values.push(data.designation); }
    if (data.department) { updates.push('department = ?'); values.push(data.department); }
    if (data.roleId) { updates.push('role_id = ?'); values.push(data.roleId); }
    if (data.actions) { updates.push('actions = ?'); values.push(JSON.stringify(data.actions)); }
    updates.push('updated_at = NOW()');
    values.push(id);
    if (updates.length > 1) await pool.execute(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = Employee;
