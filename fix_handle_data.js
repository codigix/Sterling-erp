const pool = require('./backend/config/database');

async function fixHandleData() {
  try {
    console.log('--- Fixing "handle" data in sales_order_details ---');
    
    // Find all records where product_details contains "handle" as itemName
    const [rows] = await pool.execute('SELECT sales_order_id, product_details FROM sales_order_details');
    
    for (const row of rows) {
      let productDetails = {};
      try {
        productDetails = typeof row.product_details === 'string' ? JSON.parse(row.product_details) : (row.product_details || {});
      } catch (e) {
        productDetails = {};
      }

      if (productDetails?.itemName && productDetails.itemName.trim().toLowerCase() === 'handle') {
        console.log(`Found "handle" in Order #${row.sales_order_id}. Attempting to fix...`);
        
        // Fetch the name from sales_orders
        const [orderRows] = await pool.execute('SELECT items, project_name FROM sales_orders WHERE id = ?', [row.sales_order_id]);
        if (orderRows.length > 0) {
          let items = [];
          try {
            items = typeof orderRows[0].items === 'string' ? JSON.parse(orderRows[0].items) : (orderRows[0].items || []);
          } catch (e) {
            items = [];
          }
          
          const newName = items[0]?.name || orderRows[0].project_name || 'Fixed Product Name';
          console.log(`New name will be: "${newName}"`);
          
          productDetails.itemName = newName;
          await pool.execute(
            'UPDATE sales_order_details SET product_details = ? WHERE sales_order_id = ?',
            [JSON.stringify(productDetails), row.sales_order_id]
          );
          console.log(`✓ Updated Order #${row.sales_order_id}`);
        }
      }
    }

    console.log('\n--- Final Check ---');
    const [finalDetails] = await pool.execute('SELECT sales_order_id, product_details FROM sales_order_details');
    finalDetails.forEach(detail => {
      let productDetails = {};
      try {
        productDetails = typeof detail.product_details === 'string' ? JSON.parse(detail.product_details) : (detail.product_details || {});
      } catch (e) {
        productDetails = {};
      }
      console.log(`Detail for Order #${detail.sales_order_id}: itemName = "${productDetails?.itemName || 'N/A'}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixHandleData();
