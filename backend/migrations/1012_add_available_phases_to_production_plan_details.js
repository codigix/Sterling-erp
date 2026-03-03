const pool = require('../config/database');

async function addAvailablePhasesToProductionPlanDetails() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    // Check if available_phases column exists
    const [columns] = await connection.execute('SHOW COLUMNS FROM production_plan_details LIKE "available_phases"');
    
    if (columns.length === 0) {
      await connection.execute(`
        ALTER TABLE production_plan_details 
        ADD COLUMN available_phases JSON AFTER selected_phases
      `);
      console.log('✅ Added available_phases column to production_plan_details');
    } else {
      console.log('ℹ️ available_phases column already exists in production_plan_details');
    }

    await connection.query('COMMIT');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error updating production_plan_details table:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

addAvailablePhasesToProductionPlanDetails()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
