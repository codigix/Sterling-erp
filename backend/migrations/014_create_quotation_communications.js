const db = require('../config/database');

const createQuotationCommunicationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS quotation_communications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quotation_id INT NOT NULL,
      sender_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      content_text TEXT,
      content_html LONGTEXT,
      message_id VARCHAR(255) UNIQUE,
      received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_read BOOLEAN DEFAULT FALSE,
      has_attachments BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    )
  `;

  try {
    await db.execute(query);
    console.log('✅ quotation_communications table created successfully');
  } catch (error) {
    console.error('❌ Error creating quotation_communications table:', error);
  }
};

const createQuotationAttachmentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS quotation_attachments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      communication_id INT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500),
      file_size INT,
      mime_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (communication_id) REFERENCES quotation_communications(id) ON DELETE CASCADE
    )
  `;

  try {
    await db.execute(query);
    console.log('✅ quotation_attachments table created successfully');
  } catch (error) {
    console.error('❌ Error creating quotation_attachments table:', error);
  }
};

(async () => {
  try {
    await createQuotationCommunicationsTable();
    await createQuotationAttachmentsTable();
    console.log('✅ Migration completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
})();
