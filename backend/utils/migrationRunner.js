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

    // Migration 6a: Update sales_orders status ENUM to include all workflow statuses
    try {
      await connection.execute(`
        ALTER TABLE sales_orders 
        MODIFY COLUMN status ENUM('pending', 'draft', 'ready_to_start', 'assigned', 'approved', 'in_progress', 'on_hold', 'critical', 'completed', 'delivered', 'cancelled') DEFAULT 'pending'
      `);
      console.log('✅ Updated status ENUM in sales_orders table');
    } catch (err) {
      if (err.code === 'ER_INVALID_DEFAULT') {
        console.log('⚠️ Status ENUM might already be updated, continuing...');
      } else if (err.message.includes('already exists')) {
        console.log('⚠️ Column definition already exists, continuing...');
      } else {
        console.error('❌ Error updating status ENUM:', err.message);
        throw err;
      }
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

    // Migration 9: Create client_po_details table
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
          po_value DECIMAL(12,2),
          currency VARCHAR(10) DEFAULT 'INR',
          terms_conditions JSON,
          attachments JSON,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          UNIQUE KEY unique_po_number (po_number),
          INDEX idx_sales_order (sales_order_id)
        )
      `);
      console.log('✅ client_po_details table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 10: Create design_engineering_details table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS design_engineering_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL,
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
      console.log('✅ design_engineering_details table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 10.5: Create design_project_details table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS design_project_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          root_card_id INT NOT NULL UNIQUE,
          design_id VARCHAR(255),
          project_name VARCHAR(255),
          product_name VARCHAR(255),
          design_status VARCHAR(50) DEFAULT 'draft',
          design_engineer_name VARCHAR(255),
          system_length DECIMAL(10, 2),
          system_width DECIMAL(10, 2),
          system_height DECIMAL(10, 2),
          load_capacity DECIMAL(12, 2),
          operating_environment TEXT,
          material_grade VARCHAR(255),
          surface_finish VARCHAR(255),
          steel_sections JSON,
          plates JSON,
          fasteners JSON,
          components JSON,
          electrical JSON,
          consumables JSON,
          design_specifications TEXT,
          manufacturing_instructions TEXT,
          quality_safety TEXT,
          additional_notes TEXT,
          reference_documents JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE CASCADE,
          INDEX idx_root_card (root_card_id),
          INDEX idx_design_status (design_status)
        )
      `);
      console.log('✅ design_project_details table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 11: Create material_requirements_details table
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
      console.log('✅ material_requirements_details table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 12: Create production_plan_details table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS production_plan_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL UNIQUE,
          timeline JSON,
          selected_phases JSON,
          phase_details JSON,
          production_notes TEXT,
          estimated_completion_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          INDEX idx_sales_order (sales_order_id)
        )
      `);
      console.log('✅ production_plan_details table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 13: Create quality_check_details table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS quality_check_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL UNIQUE,
          inspection_type VARCHAR(100) NOT NULL,
          inspections JSON,
          qc_status ENUM('pending', 'in_progress', 'passed', 'failed') DEFAULT 'pending',
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
      console.log('✅ quality_check_details table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 14: Create shipment_details table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS shipment_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL UNIQUE,
          shipment_method VARCHAR(100) NOT NULL,
          carrier_name VARCHAR(255),
          tracking_number VARCHAR(100),
          estimated_delivery_date DATE,
          shipping_address TEXT NOT NULL,
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
      console.log('✅ shipment_details table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 15: Create delivery_details table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS delivery_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL UNIQUE,
          delivery_date DATE,
          received_by VARCHAR(255),
          delivery_status ENUM('pending', 'in_progress', 'delivered', 'failed') DEFAULT 'pending',
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
      console.log('✅ delivery_details table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 16: Add missing columns to client_po_details table
    try {
      await connection.execute(`
        ALTER TABLE client_po_details 
        ADD COLUMN shipping_address TEXT
      `);
      console.log('✅ Added shipping_address column to client_po_details');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }

    try {
      await connection.execute(`
        ALTER TABLE client_po_details 
        ADD COLUMN project_requirements JSON
      `);
      console.log('✅ Added project_requirements column to client_po_details');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }

    // Migration 17: Create sales_order_details table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sales_order_details (
          id INT PRIMARY KEY AUTO_INCREMENT,
          sales_order_id INT NOT NULL UNIQUE,
          client_email VARCHAR(100),
          client_phone VARCHAR(20),
          estimated_end_date DATE,
          billing_address TEXT,
          shipping_address TEXT,
          product_details JSON,
          quality_compliance JSON,
          warranty_support JSON,
          payment_terms TEXT,
          project_priority VARCHAR(50),
          total_amount DECIMAL(12,2),
          project_code VARCHAR(100),
          internal_info JSON,
          special_instructions TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
          INDEX idx_sales_order (sales_order_id)
        )
      `);
      console.log('✅ sales_order_details table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 18: Create root_card_departments table
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
      console.log('✅ root_card_departments table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
    }

    // Migration 19: Create department_tasks table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS department_tasks (
          id INT PRIMARY KEY AUTO_INCREMENT,
          root_card_id INT NOT NULL,
          role_id INT NOT NULL,
          task_title VARCHAR(500) NOT NULL,
          task_description TEXT,
          status ENUM('draft', 'pending', 'in_progress', 'completed', 'on_hold') DEFAULT 'draft',
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
      console.log('✅ department_tasks table created/verified');
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
      
      try {
        await connection.execute(`
          ALTER TABLE department_tasks 
          CHANGE COLUMN status status ENUM('draft', 'pending', 'in_progress', 'completed', 'on_hold') DEFAULT 'draft'
        `);
        console.log('✅ Updated department_tasks status enum to include draft');
      } catch (alterErr) {
        if (alterErr.code !== 'ER_DUP_FIELDNAME') {
          console.log('⚠️  Could not alter department_tasks status enum:', alterErr.message);
        } else {
          console.log('✅ department_tasks status enum already updated');
        }
      }
    }

    // Migration 20: Create indexes for department tables
    try {
      await connection.execute(`
        CREATE INDEX idx_root_card_departments_root_card ON root_card_departments(root_card_id)
      `);
      console.log('✅ Index created on root_card_departments.root_card_id');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('⚠️  Index already exists on root_card_departments.root_card_id');
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_root_card_departments_role ON root_card_departments(role_id)
      `);
      console.log('✅ Index created on root_card_departments.role_id');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('⚠️  Index already exists on root_card_departments.role_id');
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_department_tasks_root_card ON department_tasks(root_card_id)
      `);
      console.log('✅ Index created on department_tasks.root_card_id');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('⚠️  Index already exists on department_tasks.root_card_id');
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_department_tasks_role ON department_tasks(role_id)
      `);
      console.log('✅ Index created on department_tasks.role_id');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('⚠️  Index already exists on department_tasks.role_id');
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_department_tasks_status ON department_tasks(status)
      `);
      console.log('✅ Index created on department_tasks.status');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('⚠️  Index already exists on department_tasks.status');
    }

    // Migration: Design Workflow Steps table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS design_workflow_steps (
          id INT PRIMARY KEY AUTO_INCREMENT,
          step_name VARCHAR(255) NOT NULL,
          step_order INT NOT NULL,
          description TEXT,
          task_template_title VARCHAR(255) NOT NULL,
          task_template_description TEXT,
          priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
          auto_create_on_trigger VARCHAR(100),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_step_order (step_order)
        )
      `);
      console.log('✅ design_workflow_steps table created/verified');

      // Insert default workflow steps if they don't exist
      try {
        await connection.execute(`
          INSERT IGNORE INTO design_workflow_steps (step_name, step_order, description, task_template_title, task_template_description, priority, auto_create_on_trigger, is_active) VALUES
          ('Project Details Input', 1, 'Input and verify all project specifications and requirements', 'Enter Project Details', 'Input project name, dimensions, load capacity, operating environment, and other specifications', 'high', 'root_card_created', TRUE),
          ('Design Document Preparation', 2, 'Create design documents including drawings and specifications', 'Prepare Design Documents', 'Create technical drawings, CAD files, and design specifications based on project requirements', 'high', 'project_details_completed', TRUE),
          ('BOM Creation', 3, 'Create Bill of Materials with all components and materials', 'Create and Validate BOM', 'Create comprehensive BOM listing all materials, components, and consumables required for manufacturing', 'high', 'design_documents_created', TRUE),
          ('Design Review & Approval', 4, 'Submit design for review and approval', 'Submit Design for Review', 'Submit completed design for review by supervisors and get approval before moving to production', 'medium', 'bom_created', TRUE),
          ('Pending Reviews Follow-up', 5, 'Track and follow up on designs awaiting review', 'Follow up on Pending Reviews', 'Monitor designs pending review and follow up with reviewers for timely approvals', 'medium', 'design_submitted', TRUE),
          ('Approved Design Documentation', 6, 'Document and archive approved designs', 'Document Approved Designs', 'Update records with approved designs and maintain design documentation for reference', 'low', 'design_approved', TRUE),
          ('Technical File Management', 7, 'Manage technical files and version control', 'Manage Technical Files', 'Organize and maintain technical files, specifications, and supporting documents with proper version control', 'medium', 'design_approved', TRUE)
        `);
        console.log('✅ Design workflow steps initialized');
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') throw err;
        console.log('⚠️  Workflow steps already exist');
      }
    } catch (err) {
      if (err.code !== 'ER_TABLE_EXISTS_ERROR') throw err;
      console.log('⚠️  design_workflow_steps table already exists');
    }

    // Create indices for design_workflow_steps
    try {
      await connection.execute(`
        CREATE INDEX idx_design_workflow_steps_order ON design_workflow_steps(step_order)
      `);
      console.log('✅ Index created on design_workflow_steps.step_order');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('⚠️  Index idx_design_workflow_steps_order already exists');
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_design_workflow_steps_trigger ON design_workflow_steps(auto_create_on_trigger)
      `);
      console.log('✅ Index created on design_workflow_steps.auto_create_on_trigger');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('⚠️  Index idx_design_workflow_steps_trigger already exists');
    }

    try {
      await connection.execute(`
        ALTER TABLE department_tasks ADD COLUMN sales_order_id INT
      `);
      console.log('✅ Added sales_order_id column to department_tasks');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
      console.log('⚠️  sales_order_id column already exists in department_tasks');
    }

    try {
      await connection.execute(`
        ALTER TABLE department_tasks ADD CONSTRAINT fk_dept_tasks_sales_order FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint for sales_order_id');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_FK_DUP_NAME' || err.message?.includes('Duplicate')) {
        console.log('⚠️  Foreign key constraint already exists');
      } else {
        throw err;
      }
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_dept_tasks_sales_order ON department_tasks(sales_order_id)
      `);
      console.log('✅ Created index on department_tasks.sales_order_id');
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
      console.log('⚠️  Index already exists');
    }

    try {
      await connection.execute(`
        UPDATE department_tasks dt
        LEFT JOIN root_cards rc ON dt.root_card_id = rc.id
        LEFT JOIN projects p ON rc.project_id = p.id
        SET dt.sales_order_id = p.sales_order_id
        WHERE dt.sales_order_id IS NULL AND p.sales_order_id IS NOT NULL
      `);
      console.log('✅ Backfilled sales_order_id for existing tasks');
    } catch (err) {
      console.log('⚠️  Could not backfill sales_order_id (might already be populated)');
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
