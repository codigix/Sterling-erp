const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Creating workstations table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS workstations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        workstation_id VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        building_area VARCHAR(255),
        responsible_dept INT,
        equipment_class VARCHAR(100),
        equipment_code VARCHAR(100),
        units_per_hour DECIMAL(15,6) DEFAULT 0.000000,
        target_utilization DECIMAL(5,2) DEFAULT 80.00,
        technical_description TEXT,
        operational_status ENUM('Operational', 'Maintenance', 'Down', 'Idle') DEFAULT 'Operational',
        is_active BOOLEAN DEFAULT TRUE,
        maintenance_schedule ENUM('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly') DEFAULT 'Monthly',
        last_maintenance_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (responsible_dept) REFERENCES departments(id) ON DELETE SET NULL
      )
    `);

    // Check if workstation_id column exists in work_order_operations, if not add it
    const [columns] = await connection.execute('SHOW COLUMNS FROM work_order_operations LIKE "workstation_id"');
    if (columns.length === 0) {
      console.log('Adding workstation_id to work_order_operations...');
      await connection.execute(`
        ALTER TABLE work_order_operations 
        ADD COLUMN workstation_id INT AFTER workstation,
        ADD FOREIGN KEY (workstation_id) REFERENCES workstations(id) ON DELETE SET NULL
      `);
    }

    await connection.commit();
    console.log('Workstation table created and integrated successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Error creating Workstation table:', error);
    throw error;
  } finally {
    connection.release();
  }
}

migrate().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
