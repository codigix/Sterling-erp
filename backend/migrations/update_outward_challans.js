const pool = require('../config/database');

async function migrate() {
  try {
    console.log('Starting migration: add work_order_operation_id to outward_challans');
    
    // Check if column already exists
    const [columns] = await pool.execute('SHOW COLUMNS FROM outward_challans LIKE "work_order_operation_id"');
    
    if (columns.length === 0) {
      await pool.execute(`
        ALTER TABLE outward_challans 
        ADD COLUMN work_order_operation_id INT NULL AFTER outsourcing_task_id,
        MODIFY COLUMN outsourcing_task_id INT NULL,
        ADD CONSTRAINT fk_oc_wo_operation FOREIGN KEY (work_order_operation_id) REFERENCES work_order_operations(id) ON DELETE CASCADE
      `);
      console.log('Column work_order_operation_id added successfully.');
    } else {
      console.log('Column work_order_operation_id already exists.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();