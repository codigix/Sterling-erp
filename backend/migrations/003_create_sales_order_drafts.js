const pool = require('../config/database');

async function createSalesOrderDraftsTable() {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS sales_order_drafts (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
    console.log('✓ sales_order_drafts table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating sales_order_drafts table:', error);
    throw error;
  }
}

module.exports = { createSalesOrderDraftsTable };
