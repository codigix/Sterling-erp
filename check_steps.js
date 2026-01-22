const pool = require('./backend/config/database');
async function check() {
  try {
    const [rows] = await pool.execute('SELECT DISTINCT step_type FROM sales_order_workflow_steps');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
