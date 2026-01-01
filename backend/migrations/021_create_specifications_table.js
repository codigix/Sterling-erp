const pool = require('../config/database');

exports.up = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create specifications table
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
    return true;
  } catch (error) {
    console.error('Error creating specifications table:', error);
    throw error;
  }
};

exports.down = async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute('DROP TABLE IF EXISTS specifications');
    
    console.log('✓ Specifications table dropped successfully');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Error dropping specifications table:', error);
    throw error;
  }
};
