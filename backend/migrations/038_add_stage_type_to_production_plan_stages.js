const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding stage_type column to production_plan_stages table...');
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'production_plan_stages' 
      AND TABLE_SCHEMA = DATABASE() 
      AND COLUMN_NAME = 'stage_type'
    `);
    
    if (columns.length > 0) {
      console.log('✓ stage_type column already exists');
      connection.release();
      return;
    }
    
    await connection.execute(`
      ALTER TABLE production_plan_stages 
      ADD COLUMN stage_type VARCHAR(50) DEFAULT 'in_house'
    `);
    
    console.log('✓ stage_type column added successfully');
    
    connection.release();
    console.log('Migration completed successfully!');
  } catch (error) {
    connection.release();
    console.error('Migration failed:', error.message);
    throw error;
  }
};
