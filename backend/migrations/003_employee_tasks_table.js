const pool = require('../config/database');

async function createEmployeeTasksTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    // Create employee_tasks table for sales order and other tasks
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employee_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(100) NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'pending',
        related_id INT,
        related_type VARCHAR(100),
        due_date DATE,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_employee (employee_id),
        INDEX idx_status (status),
        INDEX idx_type (type),
        INDEX idx_related (related_id, related_type)
      )
    `);
    
    await connection.query('COMMIT');
    console.log('✅ Employee Tasks table created successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error creating table:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createEmployeeTasksTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
