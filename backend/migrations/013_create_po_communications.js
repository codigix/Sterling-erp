const db = require('../config/database');

const createPurchaseOrderCommunicationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS purchase_order_communications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      po_id INT NOT NULL,
      sender_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      content_text TEXT,
      content_html LONGTEXT,
      message_id VARCHAR(255) UNIQUE,
      received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_read BOOLEAN DEFAULT FALSE,
      has_attachments BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
    )
  `;

  try {
    await db.execute(query);
    console.log('✅ purchase_order_communications table created successfully');
  } catch (error) {
    console.error('❌ Error creating purchase_order_communications table:', error);
  }
};

createPurchaseOrderCommunicationsTable()
  .then(() => {
    console.log("✅ Migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });

