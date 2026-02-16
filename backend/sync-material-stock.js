const pool = require('./config/database');

async function syncStock() {
  try {
    console.log('🔍 Starting Material Stock Synchronization...');
    
    // 1. Find all items in inventory that have quantity but are NOT in material_stock
    const [missingItems] = await pool.execute(`
      SELECT i.id, i.item_name, i.warehouse, i.quantity, i.batch
      FROM inventory i
      LEFT JOIN material_stock ms ON i.id = ms.material_id
      WHERE i.quantity > 0 AND ms.id IS NULL
    `);

    console.log(`📊 Found ${missingItems.length} items missing from warehouse-specific tracking.`);

    for (const item of missingItems) {
      const warehouseName = item.warehouse || 'Main Warehouse';
      console.log(`   ⚡ Syncing: ${item.item_name} -> ${warehouseName} (${item.quantity})`);
      
      await pool.execute(`
        INSERT INTO material_stock (material_id, warehouse_name, quantity, batch_no)
        VALUES (?, ?, ?, ?)
      `, [item.id, warehouseName, item.quantity, item.batch || null]);
    }

    // 2. Also ensure that SUM of material_stock matches inventory.quantity
    // This is for items that ARE in material_stock but maybe have different totals
    console.log('🔄 Verifying totals consistency...');
    const [discrepancies] = await pool.execute(`
      SELECT i.id, i.item_name, i.quantity as inv_qty, SUM(ms.quantity) as stock_qty
      FROM inventory i
      JOIN material_stock ms ON i.id = ms.material_id
      GROUP BY i.id
      HAVING inv_qty != stock_qty
    `);

    if (discrepancies.length > 0) {
      console.log(`⚠️ Found ${discrepancies.length} total discrepancies. Adjusting main inventory to match warehouse sum.`);
      for (const d of discrepancies) {
        await pool.execute('UPDATE inventory SET quantity = ? WHERE id = ?', [d.stock_qty, d.id]);
      }
    }

    console.log('✅ Synchronization completed successfully!');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    process.exit(0);
  }
}

syncStock();
