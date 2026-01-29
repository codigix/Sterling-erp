const pool = require('./config/database');
const { createComprehensiveBOMTables } = require('./migrations/045_create_comprehensive_bom_tables');

async function run() {
  try {
    console.log('Running migration 045...');
    await createComprehensiveBOMTables();
    
    // Also add bom_number if it doesn't exist (requested in UI)
    const connection = await pool.getConnection();
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'bill_of_materials' 
        AND COLUMN_NAME = 'bom_number'
        AND TABLE_SCHEMA = DATABASE()
      `);
      
      if (columns.length === 0) {
        await connection.execute('ALTER TABLE bill_of_materials ADD COLUMN bom_number VARCHAR(100)');
        console.log('✓ Added bom_number column to bill_of_materials');
      }
    } finally {
      connection.release();
    }
    
    console.log('Migration 045 completed successfully');
  } catch (error) {
    console.error('Migration 045 failed:', error.message);
  } finally {
    process.exit();
  }
}

run();
