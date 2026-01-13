const pool = require('./backend/config/database');

async function checkDepts() {
  try {
    const [rows] = await pool.execute('SELECT * FROM departments');
    rows.forEach(row => {
      console.log(`Dept #${row.id}: ${row.name}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDepts();
