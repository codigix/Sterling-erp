const pool = require('./backend/config/database');
async function check() {
  try {
    const [po] = await pool.query('DESCRIBE purchase_orders');
    console.log('PO Columns:');
    console.table(po);
    const [mr] = await pool.query('DESCRIBE material_requests');
    console.log('MR Columns:');
    console.table(mr);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
