const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    console.log('Adding "completed" status to material_requests and material_request_items...');

    // 1. Update material_requests status enum
    await connection.execute(`
      ALTER TABLE material_requests 
      MODIFY COLUMN status ENUM('draft', 'submitted', 'pending', 'approved', 'ordered', 'received', 'rejected', 'cancelled', 'completed') DEFAULT 'draft'
    `);

    // 2. Update material_request_items status enum
    await connection.execute(`
      ALTER TABLE material_request_items 
      MODIFY COLUMN status ENUM('pending', 'ordered', 'received', 'cancelled', 'completed') DEFAULT 'pending'
    `);

    await connection.query('COMMIT');
    console.log('✅ Statuses updated successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error updating statuses:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
