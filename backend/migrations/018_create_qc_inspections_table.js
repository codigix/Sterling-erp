const db = require('../config/database');

async function up() {
  const conn = await db.getConnection();
  try {
    // Check if table exists
    const [tables] = await conn.query("SHOW TABLES LIKE 'qc_inspections'");
    
    if (tables.length === 0) {
      await conn.query(`
        CREATE TABLE qc_inspections (
          id INT PRIMARY KEY AUTO_INCREMENT,
          grn_id INT,
          production_stage_id INT,
          inspector_id INT,
          inspection_type ENUM('grn', 'production_stage') NOT NULL DEFAULT 'grn',
          items_results JSON,
          status ENUM('pending', 'in_progress', 'passed', 'failed', 'conditional') DEFAULT 'pending',
          remarks TEXT,
          qr_code VARCHAR(500),
          batch_label VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (grn_id) REFERENCES grn(id),
          FOREIGN KEY (inspector_id) REFERENCES users(id)
          -- FOREIGN KEY (production_stage_id) REFERENCES production_stages(id) -- Add this if production_stages table exists
        );
      `);
      console.log('Created qc_inspections table');
    } else {
      console.log('qc_inspections table already exists');
    }
  } catch (error) {
    console.error('Error creating qc_inspections table:', error);
  } finally {
    conn.release();
  }
}

module.exports = { up };
