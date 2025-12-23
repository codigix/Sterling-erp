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

      `CREATE TABLE vendors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE inventory (
        id INT PRIMARY KEY AUTO_INCREMENT,
        item_code VARCHAR(100) UNIQUE NOT NULL,
        batch VARCHAR(100),
        rack VARCHAR(50),
        shelf VARCHAR(50),
        quantity INT NOT NULL DEFAULT 0,
        qr_code VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(100) NOT NULL,
        data JSON NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tables with foreign keys
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
