const pool = require('./config/database');
require('dotenv').config();

async function fixQualityCheckTable() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Dropping old quality_check_details table...');
    await connection.execute('DROP TABLE IF EXISTS quality_check_details');
    console.log('✅ Old table dropped\n');

    console.log('Creating new quality_check_details table with correct schema...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quality_check_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        quality_standards VARCHAR(255),
        welding_standards VARCHAR(255),
        surface_finish VARCHAR(255),
        mechanical_load_testing VARCHAR(255),
        electrical_compliance VARCHAR(255),
        documents_required TEXT,
        warranty_period VARCHAR(100),
        service_support VARCHAR(255),
        internal_project_owner INT,
        qc_status ENUM('pending', 'in_progress', 'passed', 'failed', 'conditional') DEFAULT 'pending',
        inspected_by INT,
        inspection_date TIMESTAMP NULL,
        qc_report TEXT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (internal_project_owner) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (inspected_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_so (sales_order_id),
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_qc_status (qc_status)
      )
    `);
    console.log('✅ New quality_check_details table created successfully\n');

    console.log('✅ Table fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

fixQualityCheckTable();
