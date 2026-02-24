const pool = require('../config/database');

async function createRootCardsDepartmentsTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    console.log('Checking if root_cards_departments table exists...');
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'root_cards_departments' AND TABLE_SCHEMA = 'sterling_erp'"
    );

    if (tables.length === 0) {
      console.log('Creating root_cards_departments table...');
      
      await connection.execute(`
        CREATE TABLE root_cards_departments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          root_card_id INT NOT NULL,
          department VARCHAR(100) NOT NULL,
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          assigned_by INT,
          status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, in_progress, completed',
          notes TEXT,
          UNIQUE KEY uk_root_card_department (root_card_id, department),
          FOREIGN KEY (root_card_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_department (department),
          INDEX idx_status (status),
          INDEX idx_assigned_at (assigned_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ root_cards_departments table created successfully');
    } else {
      console.log('✅ root_cards_departments table already exists, skipping migration');
    }

    await connection.query('COMMIT');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error creating root_cards_departments table:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createRootCardsDepartmentsTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
