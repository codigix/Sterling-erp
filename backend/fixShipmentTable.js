const pool = require('./config/database');
require('dotenv').config();

async function fixShipmentTable() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Dropping old shipment_details table...');
    await connection.execute('DROP TABLE IF EXISTS shipment_details');
    console.log('✅ Old table dropped\n');

    console.log('Creating new shipment_details table with correct schema...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shipment_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        delivery_schedule VARCHAR(500),
        packaging_info VARCHAR(500),
        dispatch_mode VARCHAR(255),
        installation_required VARCHAR(500),
        site_commissioning VARCHAR(500),
        marking VARCHAR(500),
        dismantling VARCHAR(500),
        packing VARCHAR(500),
        dispatch VARCHAR(500),
        shipment_method VARCHAR(100),
        carrier_name VARCHAR(255),
        tracking_number VARCHAR(100),
        estimated_delivery_date DATE,
        shipping_address TEXT,
        shipment_date TIMESTAMP NULL,
        shipment_status ENUM('pending', 'prepared', 'dispatched', 'in_transit', 'delivered') DEFAULT 'pending',
        shipment_cost DECIMAL(12,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_shipment_status (shipment_status)
      )
    `);
    console.log('✅ New shipment_details table created successfully\n');

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

fixShipmentTable();
