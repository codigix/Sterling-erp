const pool = require('./config/database');

async function clearInventoryData() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Temporarily disabled foreign key checks...');

    const tablesToClear = [
      'quotation_attachments',
      'quotation_communications',
      'quotations',
      'purchase_order_attachments',
      'purchase_order_communications',
      'purchase_orders',
      'grn',
      'goods_receipt_notes',
      'qc_inspections',
      'qc_reports',
      'stock_entries',
      'material_stock',
      'inventory_tasks',
      'inventory_workflow_steps',
      'material_request_items',
      'material_request_vendors',
      'material_requests'
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
    
    console.log('\n✨ All requested inventory and procurement data has been cleared.');
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

clearInventoryData();
