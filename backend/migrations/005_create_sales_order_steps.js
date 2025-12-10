const pool = require('../config/database');

const up = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Creating sales_order_steps table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales_order_steps (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        step_id INT NOT NULL,
        step_key VARCHAR(50) NOT NULL,
        step_name VARCHAR(100) NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'approved', 'rejected') DEFAULT 'pending',
        data JSON,
        assigned_to INT,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        UNIQUE KEY unique_so_step (sales_order_id, step_id),
        INDEX idx_so_step_status (sales_order_id, status),
        INDEX idx_step_key (step_key)
      )
    `);
    console.log('✓ Created sales_order_steps table');

    console.log('Creating client_po_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS client_po_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        po_number VARCHAR(100) NOT NULL UNIQUE,
        po_date DATE NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(100) NOT NULL,
        client_phone VARCHAR(20) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        project_code VARCHAR(100) NOT NULL,
        client_company_name VARCHAR(255),
        client_address TEXT,
        client_gstin VARCHAR(20),
        billing_address TEXT,
        po_value DECIMAL(12,2),
        currency VARCHAR(10) DEFAULT 'INR',
        terms_conditions JSON,
        attachments JSON,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_po_number (po_number)
      )
    `);
    console.log('✓ Created client_po_details table');

    console.log('Creating design_engineering_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS design_engineering_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        documents JSON NOT NULL,
        design_status ENUM('draft', 'in_review', 'approved', 'rejected') DEFAULT 'draft',
        bom_data JSON,
        drawings_3d JSON,
        specifications JSON,
        design_notes TEXT,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        approval_comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id),
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_design_status (design_status)
      )
    `);
    console.log('✓ Created design_engineering_details table');

    console.log('Creating material_requirements_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS material_requirements_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        materials JSON NOT NULL,
        total_material_cost DECIMAL(12,2),
        procurement_status ENUM('pending', 'ordered', 'received', 'partial') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id)
      )
    `);
    console.log('✓ Created material_requirements_details table');

    console.log('Creating production_plan_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS production_plan_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        timeline JSON NOT NULL,
        selected_phases JSON NOT NULL,
        phase_details JSON,
        production_notes TEXT,
        estimated_completion_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id)
      )
    `);
    console.log('✓ Created production_plan_details table');

    console.log('Creating quality_check_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quality_check_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        inspection_type VARCHAR(50) NOT NULL,
        inspections JSON NOT NULL,
        qc_status ENUM('pending', 'in_progress', 'passed', 'failed', 'conditional') DEFAULT 'pending',
        qc_report TEXT,
        inspected_by INT,
        inspection_date TIMESTAMP NULL,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (inspected_by) REFERENCES users(id),
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_qc_status (qc_status)
      )
    `);
    console.log('✓ Created quality_check_details table');

    console.log('Creating shipment_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shipment_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        shipment_method VARCHAR(50) NOT NULL,
        carrier_name VARCHAR(255),
        tracking_number VARCHAR(100),
        estimated_delivery_date DATE NOT NULL,
        shipping_address TEXT NOT NULL,
        shipment_date DATE,
        shipment_status ENUM('pending', 'ready', 'dispatched', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
        shipment_cost DECIMAL(12,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_shipment_status (shipment_status),
        INDEX idx_tracking_number (tracking_number)
      )
    `);
    console.log('✓ Created shipment_details table');

    console.log('Creating delivery_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS delivery_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        delivery_date DATE NOT NULL,
        received_by VARCHAR(255) NOT NULL,
        delivery_status ENUM('pending', 'partial', 'complete', 'signed', 'cancelled') DEFAULT 'pending',
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
    console.log('✓ Created delivery_details table');

    connection.release();
    console.log('✅ All tables created successfully');
  } catch (error) {
    connection.release();
    throw error;
  }
};

const down = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.execute('DROP TABLE IF EXISTS delivery_details');
    await connection.execute('DROP TABLE IF EXISTS shipment_details');
    await connection.execute('DROP TABLE IF EXISTS quality_check_details');
    await connection.execute('DROP TABLE IF EXISTS production_plan_details');
    await connection.execute('DROP TABLE IF EXISTS material_requirements_details');
    await connection.execute('DROP TABLE IF EXISTS design_engineering_details');
    await connection.execute('DROP TABLE IF EXISTS client_po_details');
    await connection.execute('DROP TABLE IF EXISTS sales_order_steps');
    console.log('✅ All tables dropped successfully');
    connection.release();
  } catch (error) {
    connection.release();
    throw error;
  }
};

module.exports = { up, down };
