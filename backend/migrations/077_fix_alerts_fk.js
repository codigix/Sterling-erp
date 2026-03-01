const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting migration: Force fix alerts_notifications foreign key');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Drop existing foreign key constraint
    try {
      await connection.query('ALTER TABLE alerts_notifications DROP FOREIGN KEY fk_alerts_user_id');
      console.log('Dropped old foreign key fk_alerts_user_id');
    } catch (e) {
      console.log('Could not drop fk_alerts_user_id:', e.message);
    }

    try {
      await connection.query('ALTER TABLE alerts_notifications DROP FOREIGN KEY alerts_notifications_ibfk_1');
      console.log('Dropped old foreign key alerts_notifications_ibfk_1');
    } catch (e) {
      console.log('Could not drop alerts_notifications_ibfk_1:', e.message);
    }

    // 2. Add new foreign key constraint pointing to users table
    await connection.query(`
      ALTER TABLE alerts_notifications 
      ADD CONSTRAINT fk_alerts_users_id 
      FOREIGN KEY (user_id) REFERENCES users(id) 
      ON DELETE CASCADE
    `);
    console.log('Added new foreign key fk_alerts_users_id pointing to users(id)');

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

migrate();
