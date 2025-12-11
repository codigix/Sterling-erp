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
        permissions JSON NOT NULL
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

      // Add more tables as needed...
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

    // Insert roles
    const roles = [
      { name: 'Admin', permissions: ['all'] },
      { name: 'Management', permissions: ['read_all', 'reports'] },
      { name: 'Sales', permissions: ['sales_read', 'sales_write', 'projects_read'] },
      { name: 'Engineering', permissions: ['engineering_read', 'engineering_write', 'projects_read'] },
      { name: 'Procurement', permissions: ['procurement_read', 'procurement_write'] },
      { name: 'QC', permissions: ['qc_read', 'qc_write', 'inventory_read'] },
      { name: 'Inventory', permissions: ['inventory_read', 'inventory_write'] },
      { name: 'Production Supervisor', permissions: ['production_read', 'production_write', 'worker_assign'] },
      { name: 'Worker', permissions: ['worker_tasks', 'production_read'] }
    ];

    for (const role of roles) {
      await dbPool.execute(
        'INSERT INTO roles (name, permissions) VALUES (?, ?) ON DUPLICATE KEY UPDATE permissions = VALUES(permissions)',
        [role.name, JSON.stringify(role.permissions)]
      );
    }

    console.log('Roles inserted successfully');

    // Create default admin user
    const adminRole = await dbPool.execute('SELECT id FROM roles WHERE name = ?', ['Admin']);
    const adminRoleId = adminRole[0][0].id;

    await dbPool.execute(
      'INSERT INTO users (username, password, role_id, email) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = username',
      ['admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', adminRoleId, 'admin@sterling.com'] // password: password
    );

    console.log('Default admin user created (username: admin, password: password)');

    await dbPool.end();

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    process.exit();
  }
}

initDatabase();