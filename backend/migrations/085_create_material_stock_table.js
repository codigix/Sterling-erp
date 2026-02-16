const pool = require('../config/database');

async function migrate() {
  try {
    // 1. Create the material_stock table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS material_stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_id INT NOT NULL,
        warehouse_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(15, 3) DEFAULT 0.000,
        batch_no VARCHAR(100) NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY material_warehouse_batch (material_id, warehouse_name, batch_no),
        FOREIGN KEY (material_id) REFERENCES inventory(id) ON DELETE CASCADE
      )
    `);

    // 2. Initialize material_stock with existing data from inventory table
    console.log('Initializing material_stock from existing inventory data...');
    const [existingItems] = await pool.execute(`
      SELECT id, warehouse, quantity, batch FROM inventory WHERE quantity > 0
    `);

    for (const item of existingItems) {
      if (item.warehouse && item.quantity > 0) {
        await pool.execute(`
          INSERT INTO material_stock (material_id, warehouse_name, quantity, batch_no)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `, [item.id, item.warehouse, item.quantity, item.batch || null]);
      }
    }

    console.log('✅ material_stock table created and initialized successfully');
  } catch (error) {
    console.error('❌ Error in migration:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
