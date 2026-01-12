const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Fixing alert_type column size...');
    
    try {
      await connection.execute(`
        ALTER TABLE alerts_notifications 
        MODIFY COLUMN alert_type VARCHAR(100) DEFAULT 'other'
      `);
      console.log('✓ alert_type column modified to VARCHAR(100)');
    } catch (modifyError) {
      if (modifyError.message.includes('already exists') || modifyError.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ alert_type column is already correct');
      } else {
        throw modifyError;
      }
    }
    
    connection.release();
    console.log('Migration completed successfully!');
  } catch (error) {
    connection.release();
    console.error('Migration failed:', error.message);
    throw error;
  }
};
