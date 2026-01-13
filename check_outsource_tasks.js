const pool = require('./backend/config/database');

async function checkOutsourceTasks() {
  try {
    console.log('--- Checking outsourcing_tasks ---');
    const [rows] = await pool.execute('SELECT id, product_name FROM outsourcing_tasks');
    rows.forEach(row => {
      console.log(`Task #${row.id}: product_name = "${row.product_name}"`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOutsourceTasks();
