const pool = require('./backend/config/database');
async function run() {
  try {
    const [ops] = await pool.execute('SELECT id, operation_name, work_order_id, operator_id FROM work_order_operations ORDER BY id DESC LIMIT 5');
    console.table(ops);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
