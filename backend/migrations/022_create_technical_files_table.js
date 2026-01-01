const { pool } = require('../db');

exports.up = async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS technical_files (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        file_name VARCHAR(255),
        file_path VARCHAR(500) NOT NULL,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✓ Technical files table created successfully');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Error creating technical files table:', error);
    throw error;
  }
};

exports.down = async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute('DROP TABLE IF EXISTS technical_files');
    
    console.log('✓ Technical files table dropped successfully');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Error dropping technical files table:', error);
    throw error;
  }
};
