const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding notes column to production_plan_stages table...');
    
    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'production_plan_stages' 
      AND TABLE_SCHEMA = DATABASE() 
      AND COLUMN_NAME = 'notes'
    `);
    
    if (columns.length > 0) {
      console.log('✓ Notes column already exists');
      connection.release();
      return;
    }
    
    await connection.execute(`
      ALTER TABLE production_plan_stages 
      ADD COLUMN notes TEXT NULL AFTER assigned_vendor_id
    `);
    
    console.log('✓ Notes column added successfully');
    
    connection.release();
    console.log('Migration completed successfully!');
  } catch (error) {
    connection.release();
    console.error('Migration failed:', error.message);
    throw error;
  }
};
