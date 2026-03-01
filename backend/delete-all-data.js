const pool = require('./config/database');

async function deleteAllData() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Disable foreign key checks temporarily to delete data across related tables
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    const tablesToDelete = [
      'quotations',
      'quotation_attachments',
      'quotation_communications',
      'purchase_orders',
      'purchase_order_attachments',
      'purchase_order_communications',
      'grn',
      'goods_receipt_notes',
      'stock_entries',
      'material_requests',
      'material_request_items',
      'material_request_vendors',
      'material_stock', // Stock balance/movement
      'inventory', // Stock balance
    ];

    for (const table of tablesToDelete) {
      try {
        console.log(`Deleting data from ${table}...`);
        await connection.execute(`DELETE FROM ${table}`);
        // Reset auto-increment
        await connection.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`✅ ${table} cleared`);
      } catch (error) {
        console.warn(`⚠️ Could not clear table ${table}:`, error.message);
      }
    }

    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
    console.log('\n✅ All requested tables have been cleared.');
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error during deletion:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

deleteAllData();
