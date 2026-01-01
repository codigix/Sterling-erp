const pool = require('./config/database');

async function checkTables() {
  try {
    const connection = await pool.getConnection();
    
    const [drawings] = await connection.execute(`SHOW TABLES LIKE 'drawings'`);
    const [specs] = await connection.execute(`SHOW TABLES LIKE 'specifications'`);
    
    console.log('Drawings table exists:', drawings.length > 0);
    console.log('Specifications table exists:', specs.length > 0);
    
    if (drawings.length === 0) {
      console.log('Creating drawings table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS drawings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          root_card_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          drawing_number VARCHAR(100),
          type VARCHAR(50),
          version VARCHAR(50) DEFAULT 'V1.0',
          status ENUM('Draft', 'Final', 'Approved') DEFAULT 'Draft',
          remarks TEXT,
          file_path VARCHAR(500) NOT NULL,
          format VARCHAR(50),
          size VARCHAR(50),
          uploaded_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (root_card_id) REFERENCES root_cards(id),
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log('✓ Drawings table created successfully');
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();
