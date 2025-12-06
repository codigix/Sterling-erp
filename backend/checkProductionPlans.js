const pool = require('./config/database');

async function checkSchema() {
  try {
    const connection = await pool.getConnection();
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'production_plans'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Production Plans Table Columns:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.COLUMN_TYPE}, nullable: ${col.IS_NULLABLE})`);
    });
    
    connection.release();
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkSchema();
