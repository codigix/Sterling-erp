const pool = require('../config/database');

async function migrate() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS stock_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        grn_id INT NULL,
        entry_no VARCHAR(50) UNIQUE NOT NULL,
        entry_date DATE NOT NULL,
        entry_type ENUM('Material Receipt', 'Material Issue', 'Material Transfer') NOT NULL,
        from_warehouse VARCHAR(255) NULL,
        to_warehouse VARCHAR(255) NULL,
        remarks TEXT NULL,
        items JSON NOT NULL,
        status ENUM('draft', 'submitted', 'cancelled') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (grn_id) REFERENCES grn(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Stock entries table created successfully');
  } catch (error) {
    console.error('❌ Error creating stock entries table:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
