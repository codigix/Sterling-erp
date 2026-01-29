const pool = require('../config/database');

async function addTargetWarehouseToProductionPlanStages() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    console.log('Checking for target_warehouse column in production_plan_stages...');

    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'production_plan_stages' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    
    if (!columnNames.includes('target_warehouse')) {
      console.log('Adding target_warehouse column to production_plan_stages...');
      await connection.execute('ALTER TABLE production_plan_stages ADD COLUMN target_warehouse VARCHAR(255) AFTER assigned_vendor_id');
      console.log('✅ target_warehouse column added successfully');
    } else {
      console.log('ℹ target_warehouse column already exists');
    }

  } catch (error) {
    console.error('Error updating production_plan_stages table:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
  addTargetWarehouseToProductionPlanStages()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { addTargetWarehouseToProductionPlanStages };
