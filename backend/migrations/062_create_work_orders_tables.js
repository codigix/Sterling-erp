const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Creating work_orders table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        work_order_no VARCHAR(50) UNIQUE NOT NULL,
        sales_order_id INT,
        root_card_id INT,
        project_id INT,
        item_code VARCHAR(100) NOT NULL,
        item_name VARCHAR(255),
        bom_id INT,
        quantity DECIMAL(15,6) DEFAULT 1.000000,
        unit VARCHAR(20) DEFAULT 'Nos',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('draft', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'draft',
        planned_start_date DATE,
        planned_end_date DATE,
        actual_start_date TIMESTAMP NULL,
        actual_end_date TIMESTAMP NULL,
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
        FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE SET NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    console.log('Creating work_order_operations table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_order_operations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        work_order_id INT NOT NULL,
        operation_name VARCHAR(255) NOT NULL,
        workstation VARCHAR(255),
        status ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        sequence INT NOT NULL,
        planned_start_date DATE,
        planned_end_date DATE,
        actual_start_date TIMESTAMP NULL,
        actual_end_date TIMESTAMP NULL,
        progress DECIMAL(5,2) DEFAULT 0.00,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating work_order_inventory table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_order_inventory (
        id INT PRIMARY KEY AUTO_INCREMENT,
        work_order_id INT NOT NULL,
        item_code VARCHAR(100) NOT NULL,
        item_name VARCHAR(255),
        required_qty DECIMAL(15,6) NOT NULL,
        transferred_qty DECIMAL(15,6) DEFAULT 0.000000,
        consumed_qty DECIMAL(15,6) DEFAULT 0.000000,
        yield_loss DECIMAL(15,6) DEFAULT 0.000000,
        unit VARCHAR(20),
        source_warehouse VARCHAR(255),
        status ENUM('pending', 'partially_transferred', 'fully_transferred', 'consumed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
      )
    `);

    await connection.commit();
    console.log('Work Order tables created successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Error creating Work Order tables:', error);
    throw error;
  } finally {
    connection.release();
  }
}

migrate().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
