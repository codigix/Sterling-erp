const pool = require('./backend/config/database');

async function checkEmployees() {
  try {
    const [rows] = await pool.execute('SELECT id, first_name, last_name FROM employees');
    rows.forEach(row => {
      console.log(`Employee #${row.id}: ${row.first_name} ${row.last_name}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEmployees();
