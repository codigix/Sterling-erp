const pool = require('./backend/config/database');
async function run() {
  try {
    const [ops] = await pool.execute('SELECT * FROM work_order_operations WHERE id IN (111, 115)');
    console.table(ops);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
