const pool = require('../config/database');

class Attendance {
  static async findByEmployeeId(employeeId, limit = 30) {
    const [rows] = await pool.execute(
      `SELECT * FROM attendance 
       WHERE employee_id = ? 
       ORDER BY attendance_date DESC 
       LIMIT ?`,
      [employeeId, limit]
    );
    return rows || [];
  }

  static async getAttendanceStats(employeeId, monthYear = null) {
    let query = `SELECT 
                  COUNT(*) as totalDays,
                  SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentDays,
                  SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absenceDays,
                  SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as halfDays,
                  ROUND(
                    (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) + 
                     (SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) * 0.5)) / 
                    COUNT(*) * 100, 
                    2
                  ) as attendancePercentage
                 FROM attendance 
                 WHERE employee_id = ?`;
    const params = [employeeId];

    if (monthYear) {
      query += ' AND DATE_FORMAT(attendance_date, "%Y-%m") = ?';
      params.push(monthYear);
    } else {
      query += ' AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    const [rows] = await pool.execute(query, params);
    return rows[0] || {
      totalDays: 0,
      presentDays: 0,
      absenceDays: 0,
      halfDays: 0,
      attendancePercentage: 0
    };
  }

  static async create(employeeId, attendanceDate, status, checkInTime, checkOutTime, hoursWorked) {
    const [result] = await pool.execute(
      `INSERT INTO attendance (employee_id, attendance_date, status, check_in_time, check_out_time, hours_worked, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [employeeId, attendanceDate, status, checkInTime, checkOutTime, hoursWorked]
    );
    return result.insertId;
  }

  static async update(id, status, checkInTime, checkOutTime, hoursWorked) {
    await pool.execute(
      `UPDATE attendance 
       SET status = ?, check_in_time = ?, check_out_time = ?, hours_worked = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, checkInTime, checkOutTime, hoursWorked, id]
    );
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM attendance WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async delete(id) {
    await pool.execute('DELETE FROM attendance WHERE id = ?', [id]);
  }
}

module.exports = Attendance;
