const pool = require('./backend/config/database');

async function checkDrafts() {
  try {
    const [rows] = await pool.execute('SELECT id, form_data FROM sales_order_drafts');
    console.log(`Found ${rows.length} drafts`);
    rows.forEach(row => {
      let data = {};
      try {
        data = typeof row.form_data === 'string' ? JSON.parse(row.form_data) : (row.form_data || {});
      } catch (e) {
        data = {};
      }
      console.log(`Draft #${row.id}: itemName = "${data.productDetails?.itemName || 'N/A'}"`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDrafts();
