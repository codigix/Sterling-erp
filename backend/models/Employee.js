const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Employee {
  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT e.*, r.name as role_name, d.name as department_name 
      FROM employees e 
      LEFT JOIN roles r ON e.role_id = r.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      ORDER BY e.created_at DESC`);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT e.*, r.name as role_name, d.name as department_name 
      FROM employees e 
      LEFT JOIN roles r ON e.role_id = r.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = ?`, [id]);
    return rows[0];
  }

  static async findByLoginId(loginId) {
    const [rows] = await pool.execute(`
      SELECT e.*, r.name as role_name, d.name as department_name 
      FROM employees e 
      LEFT JOIN roles r ON e.role_id = r.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.login_id = ?`, [loginId]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(`
      SELECT e.*, r.name as role_name, d.name as department_name 
      FROM employees e 
      LEFT JOIN roles r ON e.role_id = r.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.email = ?`, [email]);
    return rows[0];
  }

  static async findByDepartmentId(departmentId) {
    const [rows] = await pool.execute(`
      SELECT e.*, r.name as role_name, d.name as department_name 
      FROM employees e 
      LEFT JOIN roles r ON e.role_id = r.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.department_id = ? AND e.status = 'active'
      ORDER BY e.first_name ASC`, [departmentId]);
    return rows;
  }

  static async findByDepartmentName(departmentName) {
    const [rows] = await pool.execute(`
      SELECT e.*, r.name as role_name, d.name as department_name 
      FROM employees e 
      LEFT JOIN roles r ON e.role_id = r.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE d.name = ? AND e.status = 'active'
      ORDER BY e.first_name ASC`, [departmentName]);
    return rows;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(`
      SELECT e.*, r.name as role_name, d.name as department_name 
      FROM employees e 
      JOIN users u ON e.email = u.email
      LEFT JOIN roles r ON e.role_id = r.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE u.id = ?`, [userId]);
    return rows[0];
  }

  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [result] = await pool.execute(
      `INSERT INTO employees (first_name, last_name, email, designation, department, department_id, role_id, login_id, password, actions, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [data.firstName, data.lastName, data.email, data.designation, data.department || null, data.departmentId || null, data.roleId, data.loginId, hashedPassword, JSON.stringify(data.actions || []), 'active']
    );
    return result.insertId;
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    if (data.firstName) { updates.push('first_name = ?'); values.push(data.firstName); }
    if (data.lastName) { updates.push('last_name = ?'); values.push(data.lastName); }
    if (data.designation) { updates.push('designation = ?'); values.push(data.designation); }
    if (data.department !== undefined) { updates.push('department = ?'); values.push(data.department); }
    if (data.departmentId !== undefined) { updates.push('department_id = ?'); values.push(data.departmentId); }
    if (data.roleId) { updates.push('role_id = ?'); values.push(data.roleId); }
    if (data.actions) { updates.push('actions = ?'); values.push(JSON.stringify(data.actions)); }
    if (data.status) { updates.push('status = ?'); values.push(data.status); }
    if (data.password) { 
      const hashedPassword = await bcrypt.hash(data.password, 10);
      updates.push('password = ?'); 
      values.push(hashedPassword); 
    }
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
