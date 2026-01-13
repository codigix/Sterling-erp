const pool = require('./backend/config/database');

async function listTables() {
  try {
    const [rows] = await pool.execute('SHOW TABLES');
    const tableNames = rows.map(row => Object.values(row)[0]);
    console.log('Tables:', tableNames.join(', '));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listTables();
