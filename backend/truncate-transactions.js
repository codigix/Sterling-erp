const pool = require('./config/database');

async function truncateTransactionalData() {
  const tables = [
    'purchase_orders',
    'material_request_items',
    'material_requests',
    'grn',
    'stock_entries',
    'material_stock',
    'quotations',
    'purchase_order_communications',
    'notifications',
    'inward_challan_items',
    'inward_challans',
    'outward_challan_items',
    'outward_challans',
    'outsourcing_tasks'
  ];

  const conn = await pool.getConnection();
  try {
    console.log('Starting data truncation...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of tables) {
      try {
        await conn.query(`TRUNCATE TABLE ${table}`);
        console.log(`✅ Truncated table: ${table}`);
      } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          console.log(`ℹ️ Table ${table} does not exist, skipping...`);
        } else {
          console.error(`❌ Error truncating ${table}:`, err.message);
        }
      }
    }

    // Special case for inventory: User mentioned "stock balance"
    // Usually, we want to keep the Material Master (inventory table) but reset quantities.
    // However, if the user wants to clear everything related to stock balance:
    await conn.query('UPDATE inventory SET quantity = 0');
    console.log('✅ Reset master inventory quantities to 0');

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✨ Database cleanup completed successfully!');
  } catch (error) {
    console.error('Critical error during truncation:', error);
  } finally {
    conn.release();
    process.exit(0);
  }
}

truncateTransactionalData();
