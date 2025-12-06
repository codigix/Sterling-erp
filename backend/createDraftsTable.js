const pool = require('./config/database');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function createDraftsTable() {
  try {
    console.log('Creating sales_order_drafts table...');

    const sql = `
      CREATE TABLE IF NOT EXISTS sales_order_drafts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        form_data LONGTEXT NOT NULL,
        current_step INT DEFAULT 1,
        po_documents LONGTEXT,
        last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_updated (user_id, updated_at)
      )
    `;

    await pool.execute(sql);
    console.log('✓ sales_order_drafts table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating table:', error.message);
    process.exit(1);
  }
}

createDraftsTable();
