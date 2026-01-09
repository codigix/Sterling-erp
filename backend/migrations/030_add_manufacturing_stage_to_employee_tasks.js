const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding manufacturing_stage_id column to employee_tasks table...');
    
    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'employee_tasks' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    
    // Add 'manufacturing_stage_id' column if it doesn't exist
    if (!columnNames.includes('manufacturing_stage_id')) {
      console.log('Adding manufacturing_stage_id column...');
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD COLUMN manufacturing_stage_id INT NULL AFTER type,
        ADD FOREIGN KEY (manufacturing_stage_id) REFERENCES manufacturing_stages(id) ON DELETE SET NULL
      `);
      console.log('✓ manufacturing_stage_id column added');
    } else {
      console.log('✓ manufacturing_stage_id column already exists');
    }
    
    connection.release();
    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    connection.release();
    console.error('Migration failed:', error.message);
    throw error;
  }
};
