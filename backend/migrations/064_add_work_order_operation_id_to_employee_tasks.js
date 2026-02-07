const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Adding work_order_operation_id to employee_tasks table...');
    
    // Check if column already exists
    const [columns] = await connection.execute('SHOW COLUMNS FROM employee_tasks LIKE "work_order_operation_id"');
    
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD COLUMN work_order_operation_id INT AFTER production_plan_stage_id,
        ADD FOREIGN KEY (work_order_operation_id) REFERENCES work_order_operations(id) ON DELETE CASCADE
      `);
      console.log('work_order_operation_id added successfully.');
    } else {
      console.log('work_order_operation_id already exists.');
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Error adding work_order_operation_id to employee_tasks:', error);
    throw error;
  } finally {
    connection.release();
  }
}

migrate().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
