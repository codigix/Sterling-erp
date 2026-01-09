const pool = require('../config/database');

async function createAttendanceTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        status ENUM('present', 'absent', 'half_day', 'on_leave', 'holiday', 'weekend') DEFAULT 'present',
        check_in_time TIME,
        check_out_time TIME,
        hours_worked DECIMAL(5, 2),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        INDEX idx_employee_id (employee_id),
        INDEX idx_attendance_date (attendance_date),
        INDEX idx_status (status),
        UNIQUE KEY unique_employee_date (employee_id, attendance_date)
      )
    `);

    await connection.query('COMMIT');
    console.log('✅ Attendance table created successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error creating attendance table:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createAttendanceTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
