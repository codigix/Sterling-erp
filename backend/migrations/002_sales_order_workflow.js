const pool = require('../config/database');

async function createSalesOrderWorkflowTables() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    // Create workflow steps table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales_order_workflow_steps (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        step_number INT NOT NULL,
        step_name VARCHAR(255) NOT NULL,
        step_type ENUM('po_details', 'sales_details', 'documents_upload', 'designs_upload', 'material_request', 'production_plan', 'quality_check', 'shipment', 'delivered') NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'rejected', 'on_hold') DEFAULT 'pending',
        assigned_employee_id INT,
        assigned_at TIMESTAMP NULL,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        rejected_reason TEXT,
        notes TEXT,
        documents JSON,
        verification_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_employee_id) REFERENCES users(id),
        UNIQUE KEY unique_so_step (sales_order_id, step_number),
        INDEX idx_status (status),
        INDEX idx_assigned_employee (assigned_employee_id)
      )
    `);
    
    // Create step assignments tracking table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales_order_step_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        workflow_step_id INT NOT NULL,
        employee_id INT NOT NULL,
        assigned_by INT,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workflow_step_id) REFERENCES sales_order_workflow_steps(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES users(id),
        FOREIGN KEY (assigned_by) REFERENCES users(id),
        INDEX idx_workflow_step (workflow_step_id),
        INDEX idx_employee (employee_id)
      )
    `);
    
    // Create audit log table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales_order_step_audits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        workflow_step_id INT NOT NULL,
        changed_by INT NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        change_reason TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workflow_step_id) REFERENCES sales_order_workflow_steps(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id),
        INDEX idx_workflow_step (workflow_step_id)
      )
    `);
    
    // Add columns to sales_orders table
    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        ADD COLUMN current_step INT DEFAULT 1
      `);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }
    
    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        ADD COLUMN workflow_status ENUM('draft', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'draft'
      `);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }
    
    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        ADD COLUMN estimated_completion_date DATE
      `);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }
    
    // Create indexes (if not already created by table definition)
    try {
      await connection.execute(`
        CREATE INDEX idx_sales_order_workflow_steps_so 
        ON sales_order_workflow_steps(sales_order_id)
      `);
    } catch (err) {
      // Index might already exist, ignore
    }
    
    await connection.query('COMMIT');
    console.log('✅ Sales Order Workflow tables created successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createSalesOrderWorkflowTables()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
