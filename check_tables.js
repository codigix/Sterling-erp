const pool = require('./backend/config/database');
async function check() {
  try {
    const [qc] = await pool.execute('DESCRIBE quality_check_details');
    console.log('QC Fields:', qc.map(c => c.Field).join(', '));
    const [shipment] = await pool.execute('DESCRIBE shipment_details');
    console.log('Shipment Fields:', shipment.map(c => c.Field).join(', '));
    const [delivery] = await pool.execute('DESCRIBE delivery_details');
    console.log('Delivery Fields:', delivery.map(c => c.Field).join(', '));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
check();
