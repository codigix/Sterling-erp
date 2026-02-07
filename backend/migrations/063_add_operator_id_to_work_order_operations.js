const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Adding operator_id to work_order_operations table...');
    
    // Check if column already exists
    const [columns] = await connection.execute('SHOW COLUMNS FROM work_order_operations LIKE "operator_id"');
    
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE work_order_operations 
        ADD COLUMN operator_id INT AFTER workstation_id,
        ADD FOREIGN KEY (operator_id) REFERENCES employees(id) ON DELETE SET NULL
      `);
      console.log('operator_id added successfully.');
    } else {
      console.log('operator_id already exists.');
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Error adding operator_id to work_order_operations:', error);
    throw error;
  } finally {
    connection.release();
  }
}

migrate().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
