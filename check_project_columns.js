const pool = require('./backend/config/database');

async function checkProjectColumns() {
  try {
    const [rows] = await pool.execute('SELECT * FROM projects LIMIT 1');
    if (rows.length > 0) {
      console.log('Project columns:', Object.keys(rows[0]));
    } else {
      console.log('No projects found');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProjectColumns();
