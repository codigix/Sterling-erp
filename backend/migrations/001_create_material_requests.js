const pool = require('../config/database');

async function createMaterialRequestsTable() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS material_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sales_order_id INT NOT NULL,
        production_plan_id INT,
        material_name VARCHAR(255) NOT NULL,
        material_code VARCHAR(100),
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) DEFAULT 'Nos',
        specification TEXT,
        required_date DATE,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('draft', 'submitted', 'approved', 'ordered', 'received', 'rejected', 'cancelled') DEFAULT 'draft',
        created_by INT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_status (status),
        INDEX idx_created_date (created_at)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS material_request_vendors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_request_id INT NOT NULL,
        vendor_id INT NOT NULL,
        quoted_price DECIMAL(12, 2),
        delivery_days INT,
        notes TEXT,
        selected BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
        INDEX idx_material_request (material_request_id),
        UNIQUE KEY unique_mr_vendor (material_request_id, vendor_id)
      )
    `);

    await connection.query('COMMIT');
    console.log('✅ Material Requests tables created successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createMaterialRequestsTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
