const pool = require('./backend/config/database');
async function checkOp() {
  const [rows] = await pool.execute('SELECT * FROM work_order_operations WHERE id = 232');
  console.log('Operation 232:', rows);
  process.exit(0);
}
checkOp();
