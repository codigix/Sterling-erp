const pool = require('./backend/config/database');

async function debugItemName() {
  try {
    console.log('--- Checking sales_order_details table (All) ---');
    const [details] = await pool.execute('SELECT sales_order_id, product_details FROM sales_order_details');
    details.forEach(detail => {
      let productDetails = {};
      try {
        productDetails = typeof detail.product_details === 'string' ? JSON.parse(detail.product_details) : (detail.product_details || {});
      } catch (e) {
        productDetails = {};
      }
      console.log(`Detail for Order #${detail.sales_order_id}: itemName = "${productDetails?.itemName || 'N/A'}"`);
    });

    console.log('\n--- Checking root_cards table ---');
    const [rcs] = await pool.execute('SELECT id, sales_order_id, title FROM root_cards');
    rcs.forEach(rc => {
      console.log(`Root Card #${rc.id} (Order #${rc.sales_order_id}): Title = "${rc.title}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugItemName();
