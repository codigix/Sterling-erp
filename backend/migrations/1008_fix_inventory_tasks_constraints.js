const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Relaxing root_card_id constraint and updating unique key for inventory tasks...');
    
    // 1. Make root_card_id nullable
    await connection.execute(`
      ALTER TABLE root_card_inventory_tasks 
      MODIFY COLUMN root_card_id INT NULL
    `);
    console.log('✅ Modified root_card_id to be NULLable');

    // 2. Drop the old unique key if it exists
    // We need to find the actual name, but it should be unique_root_card_step or unique_project_step
    try {
      await connection.execute('ALTER TABLE root_card_inventory_tasks DROP INDEX unique_root_card_step');
      console.log('✅ Dropped unique_root_card_step');
    } catch (e) {
      try {
        await connection.execute('ALTER TABLE root_card_inventory_tasks DROP INDEX unique_project_step');
        console.log('✅ Dropped unique_project_step');
      } catch (e2) {
        console.log('ℹ️ No unique step index found to drop');
      }
    }

    // 3. Add new unique key that allows multiple MRs per Root Card, or standalone MRs
    // A step is unique within a Material Request. 
    // If multiple MRs are for the same Root Card, each MR has its own workflow.
    await connection.execute(`
      ALTER TABLE root_card_inventory_tasks 
      ADD UNIQUE KEY unique_mr_step (material_request_id, step_number)
    `);
    console.log('✅ Added new unique_mr_step index');

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
