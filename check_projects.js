const pool = require('./backend/config/database');

async function checkProjects() {
  try {
    const [rows] = await pool.execute('SELECT id, name FROM projects');
    rows.forEach(row => {
      console.log(`Project #${row.id}: name = "${row.name}"`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProjects();
