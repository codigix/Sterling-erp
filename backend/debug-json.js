const pool = require('./config/database');

(async () => {
  try {
    const [rows] = await pool.execute('SELECT project_requirements FROM client_po_details WHERE sales_order_id = 6');
    console.log('Raw project_requirements value:');
    console.log('Value:', rows[0]?.project_requirements);
    console.log('Type:', typeof rows[0]?.project_requirements);
    console.log('Length:', rows[0]?.project_requirements?.length);
    
    const [rows2] = await pool.execute('SELECT product_details FROM sales_order_details WHERE sales_order_id = 6');
    console.log('\nRaw product_details value:');
    console.log('Value:', rows2[0]?.product_details);
    console.log('Type:', typeof rows2[0]?.product_details);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
