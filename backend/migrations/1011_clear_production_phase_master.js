const pool = require('../config/database');

async function clearProductionPhaseMaster() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    // Delete all existing phases to provide a clean slate
    await connection.execute('DELETE FROM production_phase_master');
    
    console.log('✅ Cleared all existing production phases from master table');

    await connection.query('COMMIT');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error clearing production_phase_master table:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

clearProductionPhaseMaster()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
