const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.query('START TRANSACTION');

    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'production_plan_details' AND COLUMN_NAME = 'materials' AND TABLE_SCHEMA = DATABASE()"
    );

    if (columns.length === 0) {
      console.log('Adding materials, sub_assemblies, and finished_goods columns to production_plan_details...');
      await connection.execute(
        `ALTER TABLE production_plan_details 
         ADD COLUMN materials JSON AFTER phase_details,
         ADD COLUMN sub_assemblies JSON AFTER materials,
         ADD COLUMN finished_goods JSON AFTER sub_assemblies`
      );
      console.log('✅ Columns added successfully');
    } else {
      console.log('✅ Columns already exist, skipping migration');
    }

    await connection.query('COMMIT');
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error in migration:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
