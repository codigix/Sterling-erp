const pool = require('./config/database');
require('dotenv').config();

async function runMigrations() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting migrations...\n');

    // Migration 1: Create sales_order_drafts table
    console.log('Running Migration 1: Create sales_order_drafts table...');
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
      console.log('✅ sales_order_drafts table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration 2: Create sales_order_workflow_steps table
    console.log('Running Migration 2: Create workflow tables...');
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
      console.log('✅ sales_order_workflow_steps table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration 3: Create sales_order_step_assignments table
    console.log('Running Migration 3: Create step assignments table...');
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
      console.log('✅ sales_order_step_assignments table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration 4: Create sales_order_step_audits table
    console.log('Running Migration 4: Create audit table...');
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
      console.log('✅ sales_order_step_audits table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration 5: Create employee_tasks table
    console.log('Running Migration 5: Create employee tasks table...');
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
      console.log('✅ employee_tasks table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration 6: Add columns to sales_orders table
    console.log('Running Migration 6: Add workflow columns to sales_orders...');
    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        ADD COLUMN current_step INT DEFAULT 1
      `);
      console.log('✅ Added current_step column\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        ADD COLUMN workflow_status ENUM('draft', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'draft'
      `);
      console.log('✅ Added workflow_status column\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        ADD COLUMN estimated_completion_date DATE
      `);
      console.log('✅ Added estimated_completion_date column\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration 7: Create notifications table
    console.log('Running Migration 7: Create notifications table...');
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
      console.log('✅ notifications table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration 7.5: Create sales order steps and related tables
    console.log('Running Migration 7.5: Create sales order steps tables...');
    try {
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
      console.log('✅ sales_order_steps table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
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
      console.log('✅ client_po_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
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
      console.log('✅ design_engineering_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
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
      console.log('✅ material_requirements_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
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
      console.log('✅ production_plan_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
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
      console.log('✅ quality_check_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
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
      console.log('✅ shipment_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
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
      console.log('✅ delivery_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration 8: Create system_config table
    console.log('Running Migration 8: Create system_config table...');
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
      console.log('✅ system_config table created successfully\n');
      
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
      console.log('✅ Default configuration values inserted\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create sales_order_steps table
    console.log('Running Migration: Create sales_order_steps table...');
    try {
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
      console.log('✅ sales_order_steps table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create client_po_details table
    console.log('Running Migration: Create client_po_details table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS client_po_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL,
          po_number VARCHAR(100) NOT NULL,
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
          shipping_address TEXT,
          po_value DECIMAL(12,2),
          currency VARCHAR(10) DEFAULT 'INR',
          terms_conditions JSON,
          attachments JSON,
          project_requirements JSON,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          UNIQUE KEY unique_po_number (po_number),
          INDEX idx_sales_order (sales_order_id)
        )
      `);
      console.log('✅ client_po_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create sales_order_details table
    console.log('Running Migration: Create sales_order_details table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sales_order_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL,
          client_email VARCHAR(100),
          client_phone VARCHAR(20),
          billing_address TEXT,
          shipping_address TEXT,
          product_details JSON,
          pricing_details JSON,
          delivery_terms JSON,
          quality_compliance JSON,
          warranty_support JSON,
          internal_info JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          UNIQUE KEY unique_so (sales_order_id),
          INDEX idx_sales_order (sales_order_id)
        )
      `);
      console.log('✅ sales_order_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create design_engineering_details table
    console.log('Running Migration: Create design_engineering_details table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS design_engineering_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL,
          general_design_info JSON,
          product_specification JSON,
          base_frame_rails JSON,
          roller_saddle_assembly JSON,
          rotational_cradle JSON,
          winch_pulling_system JSON,
          electrical_control JSON,
          safety_requirements JSON,
          standards_compliance JSON,
          attachments JSON,
          comments_notes JSON,
          documents JSON,
          status VARCHAR(50) DEFAULT 'pending',
          reviewed_by INT,
          review_comments TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          FOREIGN KEY (reviewed_by) REFERENCES users(id),
          UNIQUE KEY unique_so (sales_order_id),
          INDEX idx_sales_order (sales_order_id)
        )
      `);
      console.log('✅ design_engineering_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create material_requirements_details table
    console.log('Running Migration: Create material_requirements_details table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS material_requirements_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL,
          material_procurement VARCHAR(255),
          vendor_allocation VARCHAR(255),
          incoming_inspection VARCHAR(255),
          materials JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          UNIQUE KEY unique_so (sales_order_id),
          INDEX idx_sales_order (sales_order_id)
        )
      `);
      console.log('✅ material_requirements_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create production_plan_details table
    console.log('Running Migration: Create production_plan_details table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS production_plan_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL,
          root_card_no VARCHAR(100),
          revision_no VARCHAR(10),
          stages JSON,
          production_start_date DATE,
          estimated_completion_date DATE,
          material_procurement_status VARCHAR(50),
          vendor_allocation VARCHAR(255),
          material_info JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          UNIQUE KEY unique_so (sales_order_id),
          INDEX idx_sales_order (sales_order_id)
        )
      `);
      console.log('✅ production_plan_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create quality_check_details table
    console.log('Running Migration: Create quality_check_details table...');
    try {
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
      console.log('✅ quality_check_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create shipment_details table
    console.log('Running Migration: Create shipment_details table...');
    try {
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
      console.log('✅ shipment_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create delivery_details table
    console.log('Running Migration: Create delivery_details table...');
    try {
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
      console.log('✅ delivery_details table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    console.log('Running Migration: Add is_active column to roles table...');
    try {
      await connection.execute(`
        ALTER TABLE roles ADD COLUMN is_active BOOLEAN DEFAULT TRUE
      `);
      console.log('✅ is_active column added to roles table\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE roles ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ created_at column added to roles table\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE roles ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✅ updated_at column added to roles table\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_roles_active ON roles(is_active)
      `);
      console.log('✅ Index created on roles.is_active\n');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Index already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create root_card_departments table
    console.log('Running Migration: Create root_card_departments table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS root_card_departments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          root_card_id INT NOT NULL,
          role_id INT NOT NULL,
          assignment_type ENUM('auto', 'manual') DEFAULT 'auto',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id),
          UNIQUE KEY unique_root_card_role (root_card_id, role_id)
        )
      `);
      console.log('✅ root_card_departments table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Migration: Create department_tasks table
    console.log('Running Migration: Create department_tasks table...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS department_tasks (
          id INT PRIMARY KEY AUTO_INCREMENT,
          root_card_id INT NOT NULL,
          role_id INT NOT NULL,
          task_title VARCHAR(500) NOT NULL,
          task_description TEXT,
          status ENUM('pending', 'in_progress', 'completed', 'on_hold') DEFAULT 'pending',
          priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
          assigned_by INT,
          notes JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id),
          FOREIGN KEY (assigned_by) REFERENCES users(id)
        )
      `);
      console.log('✅ department_tasks table created successfully\n');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠️  Table already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    // Create indexes for department tables
    console.log('Running Migration: Create indexes for department tables...');
    try {
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_root_card_departments_root_card ON root_card_departments(root_card_id)
      `);
      console.log('✅ Index created on root_card_departments.root_card_id\n');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Index already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_root_card_departments_role ON root_card_departments(role_id)
      `);
      console.log('✅ Index created on root_card_departments.role_id\n');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Index already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_department_tasks_root_card ON department_tasks(root_card_id)
      `);
      console.log('✅ Index created on department_tasks.root_card_id\n');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Index already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_department_tasks_role ON department_tasks(role_id)
      `);
      console.log('✅ Index created on department_tasks.role_id\n');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Index already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        CREATE INDEX IF NOT EXISTS idx_department_tasks_status ON department_tasks(status)
      `);
      console.log('✅ Index created on department_tasks.status\n');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Index already exists, skipping...\n');
      } else {
        throw err;
      }
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigrations();
