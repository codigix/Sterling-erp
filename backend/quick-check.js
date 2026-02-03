const pool = require('./config/database');
async function check() {
  const [qc] = await pool.execute('SELECT count(*) as count FROM quality_check_details WHERE sales_order_id = 6');
  const [shipment] = await pool.execute('SELECT count(*) as count FROM shipment_details WHERE sales_order_id = 6');
  const [delivery] = await pool.execute('SELECT count(*) as count FROM delivery_details WHERE sales_order_id = 6');
  console.log({qc: qc[0].count, shipment: shipment[0].count, delivery: delivery[0].count});
  await pool.end();
}
check().catch(console.error);
