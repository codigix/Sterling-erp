const pool = require('./backend/config/database');

async function addColumns() {
  try {
    const [columns] = await pool.execute('DESCRIBE sales_orders');
    const columnNames = columns.map(col => col.Field);

    let altered = false;

    if (!columnNames.includes('assigned_to')) {
      await pool.execute('ALTER TABLE sales_orders ADD COLUMN assigned_to INT DEFAULT NULL AFTER created_by');
      console.log('✅ Added assigned_to column');
      altered = true;
    }

    if (!columnNames.includes('assigned_at')) {
      await pool.execute('ALTER TABLE sales_orders ADD COLUMN assigned_at TIMESTAMP NULL DEFAULT NULL AFTER assigned_to');
      console.log('✅ Added assigned_at column');
      altered = true;
    }

    if (!altered) {
      console.log('✅ All columns already exist');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

addColumns();
