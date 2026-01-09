const pool = require('../config/database');

async function createCompanyUpdatesTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS company_updates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        category VARCHAR(100),
        is_published BOOLEAN DEFAULT TRUE,
        published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_category (category),
        INDEX idx_priority (priority),
        INDEX idx_published_date (published_date),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.query('COMMIT');
    console.log('✅ Company Updates table created successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error creating company_updates table:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createCompanyUpdatesTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
