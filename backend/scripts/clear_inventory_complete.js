const pool = require('../config/database');

async function clearInventoryData() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Temporarily disabled foreign key checks...');

    const tablesToClear = [
      'material_request_items',
      'material_requests',
      'purchase_order_attachments',
      'purchase_order_communications',
      'purchase_orders',
      'qc_reports',
      'qc_inspections',
      'grn',
      'stock_entries',
      'material_stock',
      'quotation_communications',
      'quotations'
    ];

    for (const table of tablesToClear) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
        console.log(`✅ Cleared table: ${table}`);
      } catch (err) {
        console.warn(`⚠️ Could not clear table ${table}: ${err.message}`);
      }
    }

    // Reset inventory quantities and stock related fields
    console.log('Resetting inventory stock balances...');
    await connection.query(`
      UPDATE inventory 
      SET quantity = 0, 
          valuation_rate = 0
      WHERE 1=1
    `);
    console.log('✅ Inventory quantities reset to 0');

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Re-enabled foreign key checks.');
    
    console.log('\n✨ All requested inventory, PO, Quotation, GRN, Stock, and Material Request data has been cleared.');
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

clearInventoryData();
