const pool = require('../config/database');

async function migrate() {
  try {
    console.log('Starting migration: add vendor_id to work_order_operations');
    
    // Check if column already exists
    const [columns] = await pool.execute('SHOW COLUMNS FROM work_order_operations LIKE "vendor_id"');
    
    if (columns.length === 0) {
      await pool.execute(`
        ALTER TABLE work_order_operations 
        ADD COLUMN vendor_id INT NULL AFTER operator_id,
        ADD CONSTRAINT fk_woo_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
      `);
      console.log('Column vendor_id added successfully.');
    } else {
      console.log('Column vendor_id already exists.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();