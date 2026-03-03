const pool = require('../config/database');

async function addHourlyRateToProductionPhaseMaster() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    // Check if hourly_rate column exists
    const [columns] = await connection.execute('SHOW COLUMNS FROM production_phase_master LIKE "hourly_rate"');
    
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE production_phase_master 
        ADD COLUMN hourly_rate DECIMAL(10, 2) DEFAULT 0.00 AFTER description
      `);
      console.log('✅ Added hourly_rate column to production_phase_master');
    } else {
      console.log('ℹ️ hourly_rate column already exists in production_phase_master');
    }

    await connection.query('COMMIT');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error updating production_phase_master table:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

addHourlyRateToProductionPhaseMaster()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
