const pool = require('../config/database');

async function createProductionStagesTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS production_stages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        production_plan_id INT NOT NULL,
        stage_sequence INT NOT NULL,
        stage_name VARCHAR(255) NOT NULL,
        stage_type ENUM('design', 'manufacturing', 'assembly', 'testing', 'quality_check', 'packing', 'delivery') DEFAULT 'manufacturing',
        execution_type ENUM('in-house', 'outsource') DEFAULT 'in-house',
        assigned_employee_id INT,
        assigned_vendor_id INT,
        planned_start_date DATE,
        planned_end_date DATE,
        estimated_duration_days INT,
        delay_tolerance_days INT,
        actual_start_date DATE,
        actual_end_date DATE,
        status ENUM('pending', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'pending',
        outward_challan_id INT,
        inward_challan_id INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
        INDEX idx_production_plan (production_plan_id),
        INDEX idx_status (status),
        INDEX idx_execution_type (execution_type),
        UNIQUE KEY unique_plan_sequence (production_plan_id, stage_sequence)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS production_stage_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        production_stage_id INT NOT NULL,
        task_name VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_employee_id INT,
        status ENUM('pending', 'to_do', 'in_progress', 'pause', 'done', 'cancel', 'stuck') DEFAULT 'pending',
        start_date DATETIME,
        end_date DATETIME,
        estimated_hours INT,
        actual_hours INT,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        blocked_reason TEXT,
        assigned_manager_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (production_stage_id) REFERENCES production_stages(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_manager_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_production_stage (production_stage_id),
        INDEX idx_status (status),
        INDEX idx_employee (assigned_employee_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stage_task_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        stage_task_id INT NOT NULL,
        action VARCHAR(255),
        old_value TEXT,
        new_value TEXT,
        changed_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (stage_task_id) REFERENCES production_stage_tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_task (stage_task_id),
        INDEX idx_created (created_at)
      )
    `);

    await connection.query('COMMIT');
    console.log('✅ Production Stages tables created successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createProductionStagesTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
