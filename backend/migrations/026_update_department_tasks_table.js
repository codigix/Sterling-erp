const pool = require('../config/database');

async function migrate() {
  try {
    console.log('Starting migration: Add work_order_operation_id and link to department_tasks...');
    
    // Check if work_order_operation_id exists
    const [cols] = await pool.execute("SHOW COLUMNS FROM department_tasks LIKE 'work_order_operation_id'");
    if (cols.length === 0) {
      await pool.execute("ALTER TABLE department_tasks ADD COLUMN work_order_operation_id INT NULL");
      await pool.execute("ALTER TABLE department_tasks ADD CONSTRAINT fk_dt_operation FOREIGN KEY (work_order_operation_id) REFERENCES work_order_operations(id) ON DELETE CASCADE");
      console.log('Added work_order_operation_id to department_tasks');
    }

    // Check if link exists in department_tasks
    const [linkCols] = await pool.execute("SHOW COLUMNS FROM department_tasks LIKE 'link'");
    if (linkCols.length === 0) {
      await pool.execute("ALTER TABLE department_tasks ADD COLUMN link VARCHAR(255) NULL");
      console.log('Added link to department_tasks');
    }

    // Check if link exists in alerts_notifications
    const [alertLinkCols] = await pool.execute("SHOW COLUMNS FROM alerts_notifications LIKE 'link'");
    if (alertLinkCols.length === 0) {
      await pool.execute("ALTER TABLE alerts_notifications ADD COLUMN link VARCHAR(255) NULL");
      console.log('Added link to alerts_notifications');
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
