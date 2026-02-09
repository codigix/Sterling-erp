const pool = require('./backend/config/database');
async function check() {
  try {
    const wo = 'WO-1770617262745-723';
    console.log(`Checking data for WO: ${wo}`);
    
    // 1. Find the Sales Order from Work Order
    const [woRows] = await pool.execute('SELECT sales_order_id, id FROM work_orders WHERE work_order_no = ?', [wo]);
    console.log('Work Order data:', woRows);
    
    if (woRows.length > 0) {
      const soId = woRows[0].sales_order_id;
      
      // 2. Check Quality Check Details
      const [qcdRows] = await pool.execute('SELECT * FROM quality_check_details WHERE sales_order_id = ?', [soId]);
      console.log('QC Details for SO ID:', qcdRows);
      
      // 3. Search for the job card no in whole table
      const [allQcd] = await pool.execute('SELECT id, sales_order_id, job_card_no FROM quality_check_details LIMIT 10');
      console.log('Sample QC Details:', allQcd);

      // 4. Check Root Cards for this SO
      const [rcRows] = await pool.execute('SELECT id, sales_order_id, title, code FROM root_cards WHERE sales_order_id = ?', [soId]);
      console.log('Root Cards for SO:', rcRows);
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
