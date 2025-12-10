-- Add missing columns to inventory table
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS item_name VARCHAR(255);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS vendor_id INT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12,2);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS reorder_level INT DEFAULT 0;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS specification TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit VARCHAR(50);

-- Add missing columns to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id INT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_type VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20);

-- Add columns to sales_orders for material tracking
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS design_documents JSON;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS assigned_materials JSON;

-- Add columns to manufacturing_stages for enhanced tracking
ALTER TABLE manufacturing_stages ADD COLUMN IF NOT EXISTS estimated_delay_days INT DEFAULT 0;
ALTER TABLE manufacturing_stages ADD COLUMN IF NOT EXISTS actual_delay_days INT DEFAULT 0;
ALTER TABLE manufacturing_stages ADD COLUMN IF NOT EXISTS approx_completion_time TIME;
ALTER TABLE manufacturing_stages ADD COLUMN IF NOT EXISTS duration_days INT DEFAULT 0;

-- Update worker_tasks to support additional statuses
ALTER TABLE worker_tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(50);
ALTER TABLE worker_tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE worker_tasks ADD COLUMN IF NOT EXISTS pause_count INT DEFAULT 0;
ALTER TABLE worker_tasks ADD COLUMN IF NOT EXISTS total_pause_duration INT DEFAULT 0;
ALTER TABLE worker_tasks ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity INT,
    equipment JSON,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create production_plans table
CREATE TABLE IF NOT EXISTS production_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    sales_order_id INT,
    plan_name VARCHAR(255) NOT NULL,
    status ENUM('draft', 'planning', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    created_by INT,
    assigned_supervisor INT,
    total_stages INT DEFAULT 0,
    completed_stages INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_supervisor) REFERENCES users(id)
);

-- Create production_stages table (enhanced version)
CREATE TABLE IF NOT EXISTS production_stages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_plan_id INT NOT NULL,
    stage_name VARCHAR(255) NOT NULL,
    stage_sequence INT,
    stage_type ENUM('in_house', 'outsource') DEFAULT 'in_house',
    status ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    assigned_employee_id INT,
    facility_id INT,
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date TIMESTAMP NULL,
    actual_end_date TIMESTAMP NULL,
    estimated_duration_days INT DEFAULT 0,
    estimated_delay_days INT DEFAULT 0,
    actual_delay_days INT DEFAULT 0,
    progress_percentage INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_plan_id) REFERENCES production_plans(id),
    FOREIGN KEY (assigned_employee_id) REFERENCES users(id),
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Create challan_materials table (for tracking material movement)
CREATE TABLE IF NOT EXISTS challan_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challan_id INT,
    material_id INT NOT NULL,
    quantity INT NOT NULL,
    specification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES inventory(id)
);

-- Create production_stage_tasks table (for individual task assignments)
CREATE TABLE IF NOT EXISTS production_stage_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_stage_id INT NOT NULL,
    employee_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('to_do', 'in_progress', 'pause', 'done', 'cancel') DEFAULT 'to_do',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_date TIMESTAMP NULL,
    completed_date TIMESTAMP NULL,
    pause_count INT DEFAULT 0,
    total_pause_duration INT DEFAULT 0,
    cancel_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_stage_id) REFERENCES production_stages(id),
    FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Create alerts_notifications table (for system alerts and notifications)
CREATE TABLE IF NOT EXISTS alerts_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    from_user_id INT,
    alert_type ENUM('task_blocked', 'status_update', 'delay_alert', 'material_shortage', 'quality_issue', 'other') DEFAULT 'other',
    message TEXT NOT NULL,
    related_table VARCHAR(50),
    related_id INT,
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id)
);

-- Create project_tracking table
CREATE TABLE IF NOT EXISTS project_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    milestone_name VARCHAR(255),
    target_date DATE,
    completion_percentage INT DEFAULT 0,
    status ENUM('not_started', 'in_progress', 'completed', 'delayed') DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Create employee_tracking table
CREATE TABLE IF NOT EXISTS employee_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    project_id INT,
    production_stage_id INT,
    tasks_assigned INT DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    tasks_in_progress INT DEFAULT 0,
    tasks_paused INT DEFAULT 0,
    tasks_cancelled INT DEFAULT 0,
    total_hours_worked DECIMAL(10,2) DEFAULT 0,
    efficiency_percentage INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (production_stage_id) REFERENCES production_stages(id)
);

-- Engineering Documents Tables
CREATE TABLE IF NOT EXISTS engineering_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL,
    document_type ENUM('qap', 'atp', 'pd', 'drawing', 'fea', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    version INT DEFAULT 1,
    uploaded_by INT NOT NULL,
    status ENUM('draft', 'pending_approval', 'approved', 'rejected') DEFAULT 'draft',
    approval_comments TEXT,
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- BOM (Bill of Materials) Table
CREATE TABLE IF NOT EXISTS bill_of_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL,
    engineering_document_id INT,
    bom_name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'finalized', 'sent_to_procurement', 'sent_to_production') DEFAULT 'draft',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    FOREIGN KEY (engineering_document_id) REFERENCES engineering_documents(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- BOM Line Items
CREATE TABLE IF NOT EXISTS bom_line_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bom_id INT NOT NULL,
    item_code VARCHAR(100) NOT NULL,
    item_description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50),
    unit_cost DECIMAL(12,2),
    specification TEXT,
    part_type ENUM('raw_material', 'component', 'assembly') DEFAULT 'raw_material',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id)
);

-- Purchase Requisition Table
CREATE TABLE IF NOT EXISTS purchase_requisitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bom_id INT NOT NULL,
    sales_order_id INT NOT NULL,
    pr_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('draft', 'submitted', 'approved', 'partially_ordered', 'fully_ordered', 'completed') DEFAULT 'draft',
    total_estimated_cost DECIMAL(15,2),
    created_by INT NOT NULL,
    approved_by INT,
    approval_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id),
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Purchase Order Table (enhanced)
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pr_id INT,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id INT NOT NULL,
    status ENUM('draft', 'sent', 'acknowledged', 'partially_received', 'fully_received', 'completed', 'cancelled') DEFAULT 'draft',
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    assigned_to INT,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pr_id) REFERENCES purchase_requisitions(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- GRN (Goods Receipt Note) Table
CREATE TABLE IF NOT EXISTS goods_receipt_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_id INT NOT NULL,
    grn_number VARCHAR(50) UNIQUE NOT NULL,
    received_date DATE NOT NULL,
    received_by INT NOT NULL,
    status ENUM('draft', 'submitted', 'qc_pending', 'accepted', 'rejected', 'partially_accepted') DEFAULT 'draft',
    total_items INT,
    damaged_items INT DEFAULT 0,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (received_by) REFERENCES users(id)
);

-- QC Inspection Table
CREATE TABLE IF NOT EXISTS qc_inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    grn_id INT,
    inspection_type ENUM('material', 'stage') DEFAULT 'material',
    production_stage_id INT,
    inspector_id INT NOT NULL,
    inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'in_progress', 'passed', 'failed', 'partial') DEFAULT 'pending',
    remarks TEXT,
    qr_code VARCHAR(255),
    batch_label VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grn_id) REFERENCES goods_receipt_notes(id),
    FOREIGN KEY (production_stage_id) REFERENCES production_stages(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id)
);

-- Challan Table (for material movement)
CREATE TABLE IF NOT EXISTS challans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challan_number VARCHAR(50) UNIQUE NOT NULL,
    challan_type ENUM('outward', 'inward', 'return') DEFAULT 'outward',
    production_stage_id INT,
    status ENUM('draft', 'generated', 'sent', 'received', 'completed') DEFAULT 'draft',
    created_by INT NOT NULL,
    created_date DATE NOT NULL,
    delivery_date DATE NULL,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    vendor_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_stage_id) REFERENCES production_stages(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- Challan Items
CREATE TABLE IF NOT EXISTS challan_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challan_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50),
    batch_number VARCHAR(100),
    qr_code VARCHAR(255),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challan_id) REFERENCES challans(id),
    FOREIGN KEY (material_id) REFERENCES inventory(id)
);

-- Vendor Quotation Table
CREATE TABLE IF NOT EXISTS vendor_quotations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pr_id INT NOT NULL,
    vendor_id INT NOT NULL,
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    total_quoted_amount DECIMAL(15,2) NOT NULL,
    delivery_days INT,
    payment_terms VARCHAR(255),
    valid_until DATE,
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') DEFAULT 'submitted',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pr_id) REFERENCES purchase_requisitions(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- Stock Movement Log
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'return', 'damage', 'adjustment') DEFAULT 'in',
    quantity INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    reason TEXT,
    moved_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES inventory(id),
    FOREIGN KEY (moved_by) REFERENCES users(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_item_code ON inventory(item_code);
CREATE INDEX IF NOT EXISTS idx_inventory_reorder ON inventory(reorder_level);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_production_plans_project ON production_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_production_stages_plan ON production_stages(production_plan_id);
CREATE INDEX IF NOT EXISTS idx_production_stage_tasks_employee ON production_stage_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_production_stage_tasks_status ON production_stage_tasks(status);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_project_tracking_project ON project_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_employee_tracking_employee ON employee_tracking(employee_id);
CREATE INDEX IF NOT EXISTS idx_engineering_docs_sales ON engineering_documents(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_bom_sales ON bill_of_materials(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_grn_po ON goods_receipt_notes(po_id);
CREATE INDEX IF NOT EXISTS idx_qc_grn ON qc_inspections(grn_id);
CREATE INDEX IF NOT EXISTS idx_challans_stage ON challans(production_stage_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_material ON stock_movements(material_id);

-- Production Phase Details Table
CREATE TABLE IF NOT EXISTS production_phase_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL,
    sub_task_key VARCHAR(255) NOT NULL,
    phase_name VARCHAR(255) NOT NULL,
    sub_task_name VARCHAR(255) NOT NULL,
    process_type ENUM('inhouse', 'outsource') DEFAULT 'inhouse',
    
    measurements VARCHAR(500),
    tolerances VARCHAR(500),
    equipment_specifications TEXT,
    assembly_done_by INT,
    done_by INT,
    motor_done_by INT,
    operator_name VARCHAR(255),
    painter_name VARCHAR(255),
    welder_id INT,
    
    vendor_name VARCHAR(255),
    vendor_contact VARCHAR(255),
    expected_delivery_date DATE,
    
    material_info JSON,
    specifications TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (assembly_done_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (done_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (motor_done_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (welder_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sales_order (sales_order_id),
    INDEX idx_sub_task_key (sub_task_key),
    UNIQUE KEY unique_sales_order_subtask (sales_order_id, sub_task_key)
);

-- Production Phase Tracking Table
CREATE TABLE IF NOT EXISTS production_phase_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL,
    phase_detail_id INT,
    sub_task_key VARCHAR(255) NOT NULL,
    phase_name VARCHAR(255) NOT NULL,
    sub_task_name VARCHAR(255) NOT NULL,
    step_number INT,
    process_type ENUM('inhouse', 'outsource') DEFAULT 'inhouse',
    status ENUM('Not Started', 'In Progress', 'Outsourced', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Not Started',
    
    start_time DATETIME,
    finish_time DATETIME,
    assignee VARCHAR(255),
    outward_challan_no VARCHAR(100),
    inward_challan_no VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (phase_detail_id) REFERENCES production_phase_details(id) ON DELETE SET NULL,
    INDEX idx_sales_order (sales_order_id),
    INDEX idx_status (status),
    INDEX idx_sub_task_key (sub_task_key),
    UNIQUE KEY unique_tracking (sales_order_id, sub_task_key)
);

-- Outward Challan Details Table
CREATE TABLE IF NOT EXISTS outward_challan_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL,
    tracking_id INT NOT NULL,
    challan_number VARCHAR(100) UNIQUE NOT NULL,
    vendor_name VARCHAR(255),
    vendor_contact VARCHAR(255),
    expected_delivery_date DATE,
    status ENUM('Issued', 'Dispatched', 'In Transit', 'Received', 'Cancelled') DEFAULT 'Issued',
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    dispatched_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (tracking_id) REFERENCES production_phase_tracking(id) ON DELETE CASCADE,
    INDEX idx_sales_order (sales_order_id),
    INDEX idx_challan_number (challan_number),
    INDEX idx_status (status)
);

-- Inward Challan Details Table
CREATE TABLE IF NOT EXISTS inward_challan_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    outward_challan_id INT NOT NULL,
    tracking_id INT,
    challan_number VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('Pending', 'Received', 'Inspected', 'Accepted', 'Rejected') DEFAULT 'Pending',
    received_at DATETIME,
    quality_status ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (outward_challan_id) REFERENCES outward_challan_details(id) ON DELETE CASCADE,
    FOREIGN KEY (tracking_id) REFERENCES production_phase_tracking(id) ON DELETE SET NULL,
    INDEX idx_outward_challan (outward_challan_id),
    INDEX idx_challan_number (challan_number),
    INDEX idx_status (status)
);

-- Material Requirements Details Table
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
    INDEX idx_sales_order (sales_order_id),
    INDEX idx_procurement_status (procurement_status)
);

-- Design Engineering Details Table
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
);

-- Production Plan Details Table
CREATE TABLE IF NOT EXISTS production_plan_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL UNIQUE,
    timeline JSON,
    selected_phases JSON,
    phase_details JSON,
    production_notes TEXT,
    procurement_status VARCHAR(50),
    estimated_completion_date DATE,
    production_start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    INDEX idx_sales_order (sales_order_id)
);

-- Add indexes for production phase tables
CREATE INDEX IF NOT EXISTS idx_production_phase_details_sales ON production_phase_details(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_production_phase_tracking_sales ON production_phase_tracking(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_production_phase_tracking_status ON production_phase_tracking(status);
CREATE INDEX IF NOT EXISTS idx_outward_challan_sales ON outward_challan_details(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_inward_challan_outward ON inward_challan_details(outward_challan_id);

-- Quality Check Details Table (updated to match frontend requirements)
CREATE TABLE IF NOT EXISTS quality_check_details_new (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL UNIQUE,
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
    INDEX idx_sales_order (sales_order_id),
    INDEX idx_qc_status (qc_status)
);
