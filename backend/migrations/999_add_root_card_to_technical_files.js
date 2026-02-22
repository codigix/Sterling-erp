const pool = require('../config/database');

async function migrate() {
  try {
    const connection = await pool.getConnection();
    
    // Check if root_card_id column exists in technical_files
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'technical_files' AND COLUMN_NAME = 'root_card_id'
    `);
    
    if (columns.length === 0) {
      console.log('Adding root_card_id column to technical_files table...');
      await connection.execute(`
        ALTER TABLE technical_files 
        ADD COLUMN root_card_id INT NULL,
        ADD FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE
      `);
      console.log('✓ Column added successfully');
    } else {
      console.log('✓ Column already exists');
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

migrate();
