const pool = require('../config/database');

async function migrate() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connected to database');

    try {
      console.log('Creating qc_reports table if not exists...');
      await conn.query(`
        CREATE TABLE IF NOT EXISTS qc_reports (
            id INT PRIMARY KEY AUTO_INCREMENT,
            grn_id INT,
            production_id INT,
            results JSON NOT NULL,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (grn_id) REFERENCES grn(id)
        )
      `);
      console.log('qc_reports table checked/created successfully');
    } catch (error) {
      console.error('Error creating qc_reports:', error.message);
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
}

migrate();
