const pool = require('./config/database');
require('dotenv').config();

async function fixDeliveryTable() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Dropping old delivery_details table...');
    await connection.execute('DROP TABLE IF EXISTS delivery_details');
    console.log('✅ Old table dropped\n');

    console.log('Creating new delivery_details table with correct schema...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS delivery_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        actual_delivery_date DATE,
        customer_contact VARCHAR(255),
        installation_completed VARCHAR(500),
        site_commissioning_completed VARCHAR(500),
        warranty_terms_acceptance VARCHAR(500),
        completion_remarks TEXT,
        project_manager VARCHAR(255),
        production_supervisor VARCHAR(255),
        delivery_date DATE,
        received_by VARCHAR(255),
        delivery_status ENUM('pending', 'in_progress', 'delivered', 'failed', 'partial', 'complete', 'signed', 'cancelled') DEFAULT 'pending',
        delivered_quantity INT,
        recipient_signature_path VARCHAR(500),
        delivery_notes TEXT,
        pod_number VARCHAR(100),
        delivery_cost DECIMAL(12,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_delivery_status (delivery_status)
      )
    `);
    console.log('✅ New delivery_details table created successfully\n');

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

fixDeliveryTable();
