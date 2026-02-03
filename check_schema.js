const pool = require('./backend/config/database');

async function checkSchema() {
  try {
    const [rows] = await pool.execute('DESCRIBE quality_check_details');
    console.log('Columns in quality_check_details:');
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSchema();
