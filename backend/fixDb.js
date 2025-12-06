const mysql = require('mysql2/promise');

(async () => {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Kale@1234',
      database: 'sterling_erp'
    });

    const conn = await pool.getConnection();
    
    console.log('Disabling foreign key checks...');
    await conn.execute('SET FOREIGN_KEY_CHECKS=0');
    
    console.log('Dropping all dependent tables...');
    await conn.execute('DROP TABLE IF EXISTS production_stage_tasks');
    await conn.execute('DROP TABLE IF EXISTS production_stages');
    await conn.execute('DROP TABLE IF EXISTS production_plan_stages');
    await conn.execute('DROP TABLE IF EXISTS production_plans');
    await conn.execute('DROP TABLE IF EXISTS bill_of_materials');
    await conn.execute('DROP TABLE IF EXISTS engineering_documents');
    await conn.execute('DROP TABLE IF EXISTS projects');
    await conn.execute('DROP TABLE IF EXISTS sales_orders');
    
    console.log('Re-enabling foreign key checks...');
    await conn.execute('SET FOREIGN_KEY_CHECKS=1');
    
    console.log('Creating sales_orders table with correct schema...');
    await conn.execute(`
      CREATE TABLE sales_orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer VARCHAR(255) NOT NULL,
        po_number VARCHAR(100) NOT NULL,
        order_date DATE NOT NULL,
        due_date DATE,
        total DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status ENUM('pending', 'approved', 'in_progress', 'completed', 'delivered', 'cancelled') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        items JSON NOT NULL,
        documents JSON,
        notes TEXT,
        project_scope JSON,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    
    console.log('Creating projects table...');
    await conn.execute(`
      CREATE TABLE projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) UNIQUE,
        sales_order_id INT,
        client_name VARCHAR(255),
        po_number VARCHAR(100),
        status ENUM('draft', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'draft',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        expected_start DATE,
        expected_end DATE,
        manager_id INT,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
        FOREIGN KEY (manager_id) REFERENCES users(id)
      )
    `);
    
    console.log('Creating engineering_documents table...');
    await conn.execute(`
      CREATE TABLE engineering_documents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        file_name VARCHAR(255),
        file_path VARCHAR(500),
        file_size INT,
        status ENUM('draft', 'pending_approval', 'approved', 'rejected') DEFAULT 'draft',
        version INT DEFAULT 1,
        uploaded_by INT,
        approved_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      )
    `);
    
    console.log('Creating bill_of_materials table...');
    await conn.execute(`
      CREATE TABLE bill_of_materials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        bom_number VARCHAR(100),
        status ENUM('draft', 'pending_approval', 'approved') DEFAULT 'draft',
        total_cost DECIMAL(15,2),
        created_by INT,
        approved_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      )
    `);
    
    console.log('Creating production_plans table...');
    await conn.execute(`
      CREATE TABLE production_plans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        bom_id INT,
        plan_name VARCHAR(255) NOT NULL,
        status ENUM('draft', 'planning', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
        planned_start_date DATE,
        planned_end_date DATE,
        estimated_completion_date DATE,
        supervisor_id INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id),
        FOREIGN KEY (supervisor_id) REFERENCES users(id)
      )
    `);
    
    console.log('Creating production_plan_stages table...');
    await conn.execute(`
      CREATE TABLE production_plan_stages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        production_plan_id INT NOT NULL,
        stage_name VARCHAR(255) NOT NULL,
        sequence INT,
        stage_type ENUM('in_house', 'outsource') DEFAULT 'in_house',
        duration_days INT,
        estimated_delay_days INT,
        planned_start_date DATE,
        planned_end_date DATE,
        assigned_employee_id INT,
        assigned_facility_id INT,
        assigned_vendor_id INT,
        status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_employee_id) REFERENCES users(id),
        FOREIGN KEY (assigned_vendor_id) REFERENCES vendors(id)
      )
    `);
    
    console.log('✅ All tables recreated successfully!');
    
    conn.release();
    pool.end();
  } catch(err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
