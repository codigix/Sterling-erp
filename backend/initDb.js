const pool = require('./config/database');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Create database first (if it doesn't exist)
    await pool.execute('CREATE DATABASE IF NOT EXISTS sterling_erp');

    // Switch to the database
    const mysql = require('mysql2/promise');
    const dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'sterling_erp',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create tables in correct order (no foreign keys first, then with foreign keys)
    const tableSchemas = [
      // No foreign key dependencies
      `CREATE TABLE roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        permissions JSON NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        code VARCHAR(50),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_status (status)
      )`,

      `CREATE TABLE customers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        gst_number VARCHAR(20),
        contact_person VARCHAR(255),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_name (name),
        INDEX idx_customer_status (status)
      )`,

      `CREATE TABLE warehouses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        location VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_warehouse_code (code)
      )`,

      `CREATE TABLE vendors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255),
        email VARCHAR(100),
        phone VARCHAR(20),
        address VARCHAR(500),
        category VARCHAR(100),
        vendor_type VARCHAR(100),
        rating DECIMAL(3,2) DEFAULT 0.00,
        status ENUM('active', 'inactive') DEFAULT 'active',
        total_orders INT DEFAULT 0,
        total_value DECIMAL(15,2) DEFAULT 0.00,
        last_order_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vendor_type (vendor_type),
        INDEX idx_category (category),
        INDEX idx_status (status)
      )`,

      `CREATE TABLE item_groups (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE inventory (
        id INT PRIMARY KEY AUTO_INCREMENT,
        item_code VARCHAR(100) UNIQUE NOT NULL,
        item_name VARCHAR(255),
        batch VARCHAR(100),
        specification TEXT,
        unit VARCHAR(50),
        category VARCHAR(100),
        item_group_id INT,
        valuation_rate DECIMAL(12, 2) DEFAULT 0.00,
        selling_rate DECIMAL(12, 2) DEFAULT 0.00,
        no_of_cavity INT DEFAULT 1,
        weight_per_unit DECIMAL(12, 4) DEFAULT 0.0000,
        weight_uom VARCHAR(50),
        drawing_no VARCHAR(255),
        revision VARCHAR(50),
        material_grade VARCHAR(255),
        ean_barcode VARCHAR(255),
        gst_percent DECIMAL(5, 2) DEFAULT 0.00,
        quantity INT NOT NULL DEFAULT 0,
        reorder_level INT DEFAULT 0,
        location VARCHAR(255),
        vendor_id INT,
        unit_cost DECIMAL(12, 2),
        rack VARCHAR(50),
        shelf VARCHAR(50),
        qr_code VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
        FOREIGN KEY (item_group_id) REFERENCES item_groups(id) ON DELETE SET NULL,
        INDEX idx_item_code (item_code),
        INDEX idx_category (category),
        INDEX idx_quantity (quantity),
        INDEX idx_item_group (item_group_id)
      )`,

      `CREATE TABLE reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(100) NOT NULL,
        data JSON NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tables with foreign keys
      `CREATE TABLE employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        designation VARCHAR(100) NOT NULL,
        department_id INT,
        role_id INT NOT NULL,
        login_id VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        actions JSON,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id),
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        INDEX idx_login_id (login_id),
        INDEX idx_department_id (department_id),
        INDEX idx_status (status)
      )`,

      `CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id INT NOT NULL,
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )`,

      `CREATE TABLE sales_orders (
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
        project_name VARCHAR(255),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`,

      `CREATE TABLE sales_order_drafts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        form_data LONGTEXT NOT NULL,
        current_step INT DEFAULT 1,
        po_documents LONGTEXT,
        last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_updated (user_id, updated_at)
      )`,

      `CREATE TABLE projects (
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
      )`,

      `CREATE TABLE root_cards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        sales_order_id INT,
        code VARCHAR(50) UNIQUE,
        title VARCHAR(255) NOT NULL,
        status ENUM('draft', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        planned_start DATE,
        planned_end DATE,
        created_by INT,
        assigned_supervisor INT,
        notes TEXT,
        stages JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (assigned_supervisor) REFERENCES users(id)
      )`,

      `CREATE TABLE manufacturing_stages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        root_card_id INT NOT NULL,
        stage_name VARCHAR(255) NOT NULL,
        stage_type ENUM('in_house', 'outsourced') DEFAULT 'in_house',
        status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
        assigned_worker INT,
        planned_start DATE,
        planned_end DATE,
        start_date TIMESTAMP NULL,
        end_date TIMESTAMP NULL,
        progress TINYINT UNSIGNED DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (root_card_id) REFERENCES root_cards(id),
        FOREIGN KEY (assigned_worker) REFERENCES users(id)
      )`,

      `CREATE TABLE worker_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        stage_id INT NOT NULL,
        worker_id INT NOT NULL,
        task VARCHAR(500) NOT NULL,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        logs JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stage_id) REFERENCES manufacturing_stages(id),
        FOREIGN KEY (worker_id) REFERENCES users(id)
      )`,

      `CREATE TABLE department_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        root_card_id INT NOT NULL,
        role_id INT NOT NULL,
        task_title VARCHAR(500) NOT NULL,
        task_description TEXT,
        status ENUM('draft', 'pending', 'in_progress', 'completed', 'on_hold') DEFAULT 'draft',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        assigned_by INT,
        sales_order_id INT,
        notes JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id),
        FOREIGN KEY (assigned_by) REFERENCES users(id),
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
        INDEX idx_root_card_id (root_card_id),
        INDEX idx_role_id (role_id),
        INDEX idx_status (status),
        INDEX idx_sales_order_id (sales_order_id)
      )`,

      `CREATE TABLE design_engineering_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        bomData JSON,
        drawings3D JSON,
        specifications JSON,
        documents JSON,
        designNotes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id)
      )`,

      `CREATE TABLE design_workflow_steps (
        id INT PRIMARY KEY AUTO_INCREMENT,
        step_name VARCHAR(255) NOT NULL,
        step_order INT DEFAULT 0,
        description TEXT,
        task_template_title VARCHAR(500),
        task_template_description TEXT,
        auto_create_on_trigger VARCHAR(255),
        priority VARCHAR(20) DEFAULT 'medium',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_step_order (step_order),
        INDEX idx_is_active (is_active)
      )`,

      `CREATE TABLE production_plans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        root_card_id INT NOT NULL,
        plan_name VARCHAR(255),
        status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (root_card_id) REFERENCES root_cards(id),
        INDEX idx_root_card (root_card_id)
      )`,

      `CREATE TABLE production_plan_fg (
        id INT PRIMARY KEY AUTO_INCREMENT,
        production_plan_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity DECIMAL(12, 4) DEFAULT 1,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE RESTRICT,
        INDEX idx_production_plan (production_plan_id),
        INDEX idx_item (item_id)
      )`,

      `CREATE TABLE production_plan_stages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        production_plan_id INT NOT NULL,
        root_card_id INT,
        stage_name VARCHAR(255) NOT NULL,
        stage_type ENUM('in_house', 'outsource') DEFAULT 'in_house',
        status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled', 'outward_challan_generated', 'inward_challan_generated') DEFAULT 'pending',
        planned_start_date DATE,
        planned_end_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE SET NULL,
        INDEX idx_production_plan (production_plan_id),
        INDEX idx_stage_type (stage_type),
        INDEX idx_status (status)
      )`,

      `CREATE TABLE outsourcing_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        production_plan_stage_id INT NOT NULL,
        production_plan_id INT NOT NULL,
        project_id INT,
        root_card_id INT,
        product_name VARCHAR(255),
        status ENUM('pending', 'outward_challan_generated', 'inward_challan_generated', 'completed', 'cancelled') DEFAULT 'pending',
        selected_vendor_id INT,
        assigned_department VARCHAR(100) DEFAULT 'Production',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (production_plan_stage_id) REFERENCES production_plan_stages(id) ON DELETE CASCADE,
        FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE SET NULL,
        FOREIGN KEY (selected_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_production_plan_stage (production_plan_stage_id),
        INDEX idx_production_plan (production_plan_id),
        INDEX idx_status (status),
        INDEX idx_vendor (selected_vendor_id)
      )`,

      `CREATE TABLE outward_challans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        outsourcing_task_id INT NOT NULL,
        challan_number VARCHAR(100) UNIQUE NOT NULL,
        vendor_id INT NOT NULL,
        status ENUM('draft', 'issued', 'received', 'cancelled') DEFAULT 'draft',
        material_sent_date DATE,
        expected_return_date DATE,
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (outsourcing_task_id) REFERENCES outsourcing_tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_challan (challan_number),
        INDEX idx_outsourcing_task (outsourcing_task_id),
        INDEX idx_vendor (vendor_id),
        INDEX idx_status (status),
        INDEX idx_created_date (created_at)
      )`,

      `CREATE TABLE outward_challan_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        outward_challan_id INT NOT NULL,
        material_id INT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (outward_challan_id) REFERENCES outward_challans(id) ON DELETE CASCADE,
        FOREIGN KEY (material_id) REFERENCES inventory(id) ON DELETE RESTRICT,
        INDEX idx_challan (outward_challan_id),
        INDEX idx_material (material_id)
      )`,

      `CREATE TABLE inward_challans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        outward_challan_id INT NOT NULL,
        challan_number VARCHAR(100) UNIQUE NOT NULL,
        status ENUM('draft', 'received', 'inspected', 'rejected') DEFAULT 'draft',
        received_date DATE,
        received_by INT,
        inspection_notes TEXT,
        quality_status VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (outward_challan_id) REFERENCES outward_challans(id) ON DELETE CASCADE,
        FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_inward_challan (challan_number),
        INDEX idx_outward_challan (outward_challan_id),
        INDEX idx_status (status),
        INDEX idx_received_date (received_date)
      )`,

      `CREATE TABLE inward_challan_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        inward_challan_id INT NOT NULL,
        outward_challan_item_id INT,
        material_id INT NOT NULL,
        quantity_received DECIMAL(10, 2) NOT NULL,
        quantity_expected DECIMAL(10, 2),
        unit VARCHAR(50),
        quality_status ENUM('accepted', 'rejected', 'pending_inspection') DEFAULT 'pending_inspection',
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (inward_challan_id) REFERENCES inward_challans(id) ON DELETE CASCADE,
        FOREIGN KEY (outward_challan_item_id) REFERENCES outward_challan_items(id) ON DELETE SET NULL,
        FOREIGN KEY (material_id) REFERENCES inventory(id) ON DELETE RESTRICT,
        INDEX idx_challan (inward_challan_id),
        INDEX idx_material (material_id),
        INDEX idx_quality_status (quality_status)
      )`,

      `CREATE TABLE IF NOT EXISTS sales_orders_management (
        id INT PRIMARY KEY AUTO_INCREMENT,
        root_card_id INT,
        bom_id INT NOT NULL,
        so_number VARCHAR(100) UNIQUE NOT NULL,
        customer_id INT NOT NULL,
        warehouse_id INT,
        quantity DECIMAL(12, 4) NOT NULL,
        unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
        tax_percent DECIMAL(5, 2) DEFAULT 18,
        discount DECIMAL(12, 2) DEFAULT 0,
        order_date DATE NOT NULL,
        delivery_date DATE NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE SET NULL,
        FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE RESTRICT,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES employees(id),
        INDEX idx_root_card_id (root_card_id),
        INDEX idx_bom_id (bom_id),
        INDEX idx_customer_id (customer_id),
        INDEX idx_warehouse_id (warehouse_id),
        INDEX idx_status (status)
      )`
    ];

    for (const tableSchema of tableSchemas) {
      try {
        console.log(`Creating table: ${tableSchema.split('(')[0].replace('CREATE TABLE', '').trim()}...`);
        await dbPool.execute(tableSchema);
        console.log('✓ Success');
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('Table already exists, skipping...');
        } else {
          console.log(`✗ Failed: ${error.message}`);
          throw error;
        }
      }
    }

    console.log('Schema created successfully');
    console.log('Note: Roles and users must be created through the application interface');

    await dbPool.end();

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    process.exit();
  }
}

initDatabase();
