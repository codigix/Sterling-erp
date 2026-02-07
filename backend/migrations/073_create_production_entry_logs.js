const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Creating work_order_time_logs table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_order_time_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        operation_id INT NOT NULL,
        operator_id INT,
        workstation_id INT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration_minutes INT,
        produced_qty DECIMAL(15,6) DEFAULT 0.000000,
        shift VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (operation_id) REFERENCES work_order_operations(id) ON DELETE CASCADE,
        FOREIGN KEY (operator_id) REFERENCES employees(id) ON DELETE SET NULL,
        FOREIGN KEY (workstation_id) REFERENCES workstations(id) ON DELETE SET NULL
      )
    `);

    console.log('Creating work_order_quality_entries table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_order_quality_entries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        operation_id INT NOT NULL,
        operator_id INT,
        inspection_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        accepted_qty DECIMAL(15,6) DEFAULT 0.000000,
        rejected_qty DECIMAL(15,6) DEFAULT 0.000000,
        scrap_qty DECIMAL(15,6) DEFAULT 0.000000,
        rejection_reason VARCHAR(255),
        shift VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (operation_id) REFERENCES work_order_operations(id) ON DELETE CASCADE,
        FOREIGN KEY (operator_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    console.log('Creating work_order_downtime_logs table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS work_order_downtime_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        operation_id INT NOT NULL,
        downtime_type VARCHAR(100) NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration_minutes INT,
        shift VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (operation_id) REFERENCES work_order_operations(id) ON DELETE CASCADE
      )
    `);

    await connection.commit();
    console.log('Production Entry log tables created successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Error creating Production Entry log tables:', error);
    throw error;
  } finally {
    connection.release();
  }
}

migrate().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
