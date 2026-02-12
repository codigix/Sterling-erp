const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    console.log('Updating material_requests status enum...');

    // Add 'pending' to the status enum
    await connection.execute(`
      ALTER TABLE material_requests 
      MODIFY COLUMN status ENUM('draft', 'submitted', 'pending', 'approved', 'ordered', 'received', 'rejected', 'cancelled') DEFAULT 'draft'
    `);

    await connection.query('COMMIT');
    console.log('✅ Material Requests status enum updated successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error updating enum:', error.message);
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