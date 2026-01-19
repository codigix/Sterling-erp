const pool = require('./backend/config/database');

async function migrate() {
  try {
    console.log('Starting migration...');
    const connection = await pool.getConnection();
    
    // Check if columns exist first to avoid errors
    const [columns] = await connection.execute('SHOW COLUMNS FROM bill_of_materials');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('root_card_id')) {
      console.log('Adding root_card_id...');
      await connection.execute('ALTER TABLE bill_of_materials ADD COLUMN root_card_id INT NULL');
    }
    
    if (!columnNames.includes('project_id')) {
      console.log('Adding project_id...');
      await connection.execute('ALTER TABLE bill_of_materials ADD COLUMN project_id INT NULL');
    }
    
    if (!columnNames.includes('total_cost')) {
      console.log('Adding total_cost...');
      await connection.execute('ALTER TABLE bill_of_materials ADD COLUMN total_cost DECIMAL(15,2) DEFAULT 0.00');
    }

    if (!columnNames.includes('status')) {
       // Check if status exists, if not add it. ComprehensiveBOM.js model says it inserts 'draft' into status.
       // So it might already exist.
    } else {
        // If status exists, ensure it's the right type if needed, but usually it's already VARCHAR or ENUM.
    }

    console.log('Migration completed successfully');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
