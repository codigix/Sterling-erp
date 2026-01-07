const pool = require('./config/database');
require('dotenv').config();

async function deleteAllEmployees() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔍 Deleting all employees from database...\n');

    const [result] = await connection.execute('DELETE FROM employees');
    console.log(`✅ Deleted ${result.affectedRows} employee(s)`);
    
    console.log('\n✅ Employee deletion completed successfully!');

  } catch (err) {
    console.error('❌ Employee deletion failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

deleteAllEmployees();
