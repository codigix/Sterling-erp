const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Creating alerts_notifications table...');
    
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'alerts_notifications' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (tables.length > 0) {
      console.log('✓ alerts_notifications table already exists');
      connection.release();
      return;
    }
    
    await connection.execute(`
      CREATE TABLE alerts_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        from_user_id INT,
        alert_type VARCHAR(100) DEFAULT 'other',
        message LONGTEXT NOT NULL,
        related_table VARCHAR(100),
        related_id INT,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_alert_type (alert_type),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log('✓ alerts_notifications table created successfully');
    connection.release();
  } catch (error) {
    connection.release();
    console.error('✗ Migration failed:', error.message);
    throw error;
  }
};
