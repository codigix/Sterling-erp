const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Updating employee_tasks table with missing columns...');
    
    // Check if columns already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'employee_tasks' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    
    // Add 'type' column if it doesn't exist
    if (!columnNames.includes('type')) {
      console.log('Adding type column...');
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD COLUMN type VARCHAR(50) DEFAULT 'general' AFTER description
      `);
      console.log('✓ type column added');
    } else {
      console.log('✓ type column already exists');
    }
    
    // Add 'notes' column if it doesn't exist
    if (!columnNames.includes('notes')) {
      console.log('Adding notes column...');
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD COLUMN notes TEXT NULL AFTER status
      `);
      console.log('✓ notes column added');
    } else {
      console.log('✓ notes column already exists');
    }
    
    // Add 'started_at' column if it doesn't exist
    if (!columnNames.includes('started_at')) {
      console.log('Adding started_at column...');
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD COLUMN started_at TIMESTAMP NULL AFTER due_date
      `);
      console.log('✓ started_at column added');
    } else {
      console.log('✓ started_at column already exists');
    }
    
    // Add 'completed_at' column if it doesn't exist
    if (!columnNames.includes('completed_at')) {
      console.log('Adding completed_at column...');
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD COLUMN completed_at TIMESTAMP NULL AFTER started_at
      `);
      console.log('✓ completed_at column added');
    } else {
      console.log('✓ completed_at column already exists');
    }
    
    connection.release();
    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    connection.release();
    console.error('Migration failed:', error.message);
    throw error;
  }
};
