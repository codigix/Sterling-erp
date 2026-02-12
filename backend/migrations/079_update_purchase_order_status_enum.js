const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    console.log('Updating purchase_orders status ENUM...');

    // Update status ENUM to include new statuses
    await connection.execute(`
      ALTER TABLE purchase_orders 
      MODIFY COLUMN status ENUM('draft', 'submitted', 'pending', 'approved', 'ordered', 'received', 'delivered', 'fulfilled', 'cancelled') DEFAULT 'draft'
    `);

    await connection.query('COMMIT');
    console.log('✅ Purchase Orders status ENUM updated successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error updating ENUM:', error.message);
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
