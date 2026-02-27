const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Adding material_request_id to root_card_inventory_tasks table...');
    
    // Check if column exists first
    const [columns] = await connection.execute('SHOW COLUMNS FROM root_card_inventory_tasks LIKE "material_request_id"');
    
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE root_card_inventory_tasks 
        ADD COLUMN material_request_id INT AFTER production_root_card_id,
        ADD FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE SET NULL,
        ADD INDEX idx_mr_id (material_request_id)
      `);
      console.log('✅ Added material_request_id column');
    } else {
      console.log('ℹ️ material_request_id column already exists');
    }

    await connection.commit();
    console.log('Migration completed successfully!');
  } catch (error) {
    await connection.rollback();
    console.error('Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

migrate().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
