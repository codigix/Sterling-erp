const pool = require('../config/database');

async function migrate() {
  try {
    const connection = await pool.getConnection();
    
    // Check if status column exists in drawings
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'drawings' AND COLUMN_NAME = 'status'
    `);
    
    if (columns.length === 0) {
      console.log('Adding status column to drawings table...');
      await connection.execute(`
        ALTER TABLE drawings 
        ADD COLUMN status VARCHAR(50) DEFAULT 'Draft'
      `);
      console.log('✓ Column added successfully');
    } else {
      console.log('✓ Column already exists');
    }

    // Check if status column exists in specifications
    const [specColumns] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'specifications' AND COLUMN_NAME = 'status'
    `);
    
    if (specColumns.length === 0) {
      console.log('Adding status column to specifications table...');
      await connection.execute(`
        ALTER TABLE specifications 
        ADD COLUMN status VARCHAR(50) DEFAULT 'Draft'
      `);
      console.log('✓ Specification status column added successfully');
    } else {
      console.log('✓ Specification status column already exists');
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

migrate();
