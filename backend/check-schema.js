const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(`
      SELECT sales_order_id, materials FROM material_requirements_details
    `);
    console.log('Material Requirements:');
    rows.forEach(r => {
      console.log(`  Sales Order ID: ${r.sales_order_id}`);
      console.log(`  Materials: ${JSON.stringify(r.materials, null, 2)}`);
    });
    conn.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
})();
