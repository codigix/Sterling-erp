const pool = require('./backend/config/database');

async function checkProjectCategories() {
  try {
    const [rows] = await pool.execute('SELECT id, project_category FROM projects');
    rows.forEach(row => {
      console.log(`Project #${row.id}: category = "${row.project_category}"`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProjectCategories()
  .catch(err => {
    // If column doesn't exist
    pool.execute('SELECT * FROM projects LIMIT 1').then(([rows]) => {
      console.log('Project columns:', Object.keys(rows[0] || {}));
      process.exit(0);
    });
  });
