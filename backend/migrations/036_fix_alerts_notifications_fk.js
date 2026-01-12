const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Fixing alerts_notifications table foreign keys...');
    
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'alerts_notifications' 
      AND COLUMN_NAME = 'user_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (constraints.length > 0) {
      const constraintName = constraints[0].CONSTRAINT_NAME;
      console.log(`Dropping foreign key: ${constraintName}`);
      
      try {
        await connection.execute(`
          ALTER TABLE alerts_notifications 
          DROP FOREIGN KEY ${constraintName}
        `);
        console.log('✓ Old foreign key removed');
      } catch (dropError) {
        console.log('FK may not exist, continuing...');
      }
    }
    
    try {
      await connection.execute(`
        ALTER TABLE alerts_notifications 
        ADD CONSTRAINT fk_alerts_user_id 
        FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
      `);
      console.log('✓ New foreign key constraint added (references employees)');
    } catch (addError) {
      if (addError.message.includes('already exists')) {
        console.log('✓ Foreign key already points to employees');
      } else {
        throw addError;
      }
    }
    
    connection.release();
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    connection.release();
    console.error('✗ Migration failed:', error.message);
    throw error;
  }
};
