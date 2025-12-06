const pool = require('../config/database');

async function runMigrations() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting database migrations...\n');

    // Migration 1: Create sales_order_drafts table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sales_order_drafts (
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
        )
      `);
      console.log('✅ sales_order_drafts table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 2: Create sales_order_workflow_steps table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sales_order_workflow_steps (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL,
          step_number INT NOT NULL,
          step_name VARCHAR(255) NOT NULL,
          step_type ENUM('po_details', 'sales_details', 'documents_upload', 'designs_upload', 'material_request', 'production_plan', 'quality_check', 'shipment', 'delivered') NOT NULL,
          status ENUM('pending', 'in_progress', 'completed', 'rejected', 'on_hold') DEFAULT 'pending',
          assigned_employee_id INT,
          assigned_at TIMESTAMP NULL,
          started_at TIMESTAMP NULL,
          completed_at TIMESTAMP NULL,
          rejected_reason TEXT,
          notes TEXT,
          documents JSON,
          verification_data JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_employee_id) REFERENCES users(id),
          UNIQUE KEY unique_so_step (sales_order_id, step_number),
          INDEX idx_status (status),
          INDEX idx_assigned_employee (assigned_employee_id)
        )
      `);
      console.log('✅ sales_order_workflow_steps table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 3: Create sales_order_step_assignments table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sales_order_step_assignments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          workflow_step_id INT NOT NULL,
          employee_id INT NOT NULL,
          assigned_by INT,
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (workflow_step_id) REFERENCES sales_order_workflow_steps(id) ON DELETE CASCADE,
          FOREIGN KEY (employee_id) REFERENCES users(id),
          FOREIGN KEY (assigned_by) REFERENCES users(id),
          INDEX idx_workflow_step (workflow_step_id),
          INDEX idx_employee (employee_id)
        )
      `);
      console.log('✅ sales_order_step_assignments table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 4: Create sales_order_step_audits table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sales_order_step_audits (
          id INT PRIMARY KEY AUTO_INCREMENT,
          workflow_step_id INT NOT NULL,
          changed_by INT NOT NULL,
          old_status VARCHAR(50),
          new_status VARCHAR(50),
          change_reason TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (workflow_step_id) REFERENCES sales_order_workflow_steps(id) ON DELETE CASCADE,
          FOREIGN KEY (changed_by) REFERENCES users(id),
          INDEX idx_workflow_step (workflow_step_id)
        )
      `);
      console.log('✅ sales_order_step_audits table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 5: Create employee_tasks table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS employee_tasks (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(100) NOT NULL,
          priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
          status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'pending',
          related_id INT,
          related_type VARCHAR(100),
          due_date DATE,
          started_at TIMESTAMP NULL,
          completed_at TIMESTAMP NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_employee (employee_id),
          INDEX idx_status (status),
          INDEX idx_type (type),
          INDEX idx_related (related_id, related_type)
        )
      `);
      console.log('✅ employee_tasks table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 6: Add columns to sales_orders table
    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        ADD COLUMN current_step INT DEFAULT 1
      `);
      console.log('✅ Added current_step column to sales_orders');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }

    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        ADD COLUMN workflow_status ENUM('draft', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'draft'
      `);
      console.log('✅ Added workflow_status column to sales_orders');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }

    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        ADD COLUMN estimated_completion_date DATE
      `);
      console.log('✅ Added estimated_completion_date column to sales_orders');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }

    // Migration 7: Create notifications table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(100) NOT NULL DEFAULT 'info',
          related_id INT,
          related_type VARCHAR(100),
          read_status TINYINT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user (user_id),
          INDEX idx_read_status (read_status),
          INDEX idx_type (type),
          INDEX idx_related (related_id, related_type)
        )
      `);
      console.log('✅ notifications table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 8: Create system_config table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS system_config (
          id INT PRIMARY KEY AUTO_INCREMENT,
          config_type VARCHAR(100) NOT NULL,
          config_key VARCHAR(255) NOT NULL,
          config_value VARCHAR(255) NOT NULL,
          description TEXT,
          is_active TINYINT DEFAULT 1,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_config (config_type, config_key),
          INDEX idx_config_type (config_type),
          INDEX idx_is_active (is_active)
        )
      `);
      console.log('✅ system_config table created/verified');

      const configs = [
        ['project_category', 'defense', 'Defense', 1],
        ['project_category', 'r_and_d', 'R&D', 2],
        ['project_category', 'prototype', 'Prototype', 3],
        ['material_unit', 'pieces', 'Pieces', 1],
        ['material_unit', 'kg', 'KG', 2],
        ['material_unit', 'meter', 'Meter', 3],
        ['material_unit', 'liter', 'Liter', 4],
        ['material_unit', 'box', 'Box', 5],
        ['material_source', 'procurement', 'Procurement', 1],
        ['material_source', 'inventory', 'Inventory', 2],
        ['priority_level', 'low', 'Low', 1],
        ['priority_level', 'medium', 'Medium', 2],
        ['priority_level', 'high', 'High', 3],
        ['priority_level', 'urgent', 'Urgent', 4],
        ['process_type', 'in_house', 'In-House', 1],
        ['process_type', 'outsourced', 'Outsourced', 2]
      ];

      for (const [type, key, value, order] of configs) {
        try {
          await connection.execute(
            `INSERT IGNORE INTO system_config (config_type, config_key, config_value, display_order, is_active)
             VALUES (?, ?, ?, ?, 1)`,
            [type, key, value, order]
          );
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') throw err;
        }
      }
      console.log('✅ Default configuration values inserted');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { runMigrations };
