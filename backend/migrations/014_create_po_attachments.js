const db = require('../config/database');

const createPurchaseOrderAttachmentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS purchase_order_attachments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      communication_id INT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      file_size INT,
      mime_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (communication_id) REFERENCES purchase_order_communications(id) ON DELETE CASCADE
    )
  `;

  try {
    await db.execute(query);
    console.log('✅ purchase_order_attachments table created successfully');
  } catch (error) {
    console.error('❌ Error creating purchase_order_attachments table:', error);
    process.exit(1);
  }
};

createPurchaseOrderAttachmentsTable()
  .then(() => {
    console.log("✅ Migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
