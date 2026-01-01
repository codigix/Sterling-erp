const pool = require('./config/database');

async function runMigration() {
  try {
    const connection = await pool.getConnection();
    
    console.log('Creating specifications table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS specifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        version VARCHAR(50) DEFAULT 'v1.0',
        file_name VARCHAR(255),
        file_path VARCHAR(500) NOT NULL,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('✓ Specifications table created successfully');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

runMigration();
