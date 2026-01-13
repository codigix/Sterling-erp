const pool = require('./backend/config/database');

async function checkDesignProjectDetails() {
  try {
    const [rows] = await pool.execute('SELECT id, product_name FROM design_project_details');
    rows.forEach(row => {
      console.log(`Design Details #${row.id}: product_name = "${row.product_name}"`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDesignProjectDetails();
