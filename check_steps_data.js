const pool = require('./backend/config/database');

async function checkSteps() {
  try {
    const [rows] = await pool.execute('SELECT id, sales_order_id, data FROM sales_order_steps');
    rows.forEach(row => {
      const rowString = JSON.stringify(row).toLowerCase();
      if (rowString.includes('handle')) {
        console.log(`Match in sales_order_steps (ID: ${row.id}):`);
        console.log(`  Data: ${row.data.substring(0, 500)}`);
      }
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSteps();
