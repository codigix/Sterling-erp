-- Database Schema for Sterling ERP

CREATE DATABASE IF NOT EXISTS sterling_erp;
USE sterling_erp;

-- Users and Roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSON NOT NULL
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Sales Orders and Projects
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
);

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
);

-- Engineering Documents
CREATE TABLE engineering_docs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    type ENUM('QAP', 'ATP', 'Drawings', 'PD', 'FEA') NOT NULL,
    file_path VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- BOM
CREATE TABLE bom (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    items JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Vendors and Procurement
CREATE TABLE vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pr_id INT NOT NULL,
    vendor_id INT NOT NULL,
    items JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE purchase_requisitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    items JSON NOT NULL,
    status ENUM('pending', 'approved', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE purchase_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quotation_id INT NOT NULL,
    items JSON NOT NULL,
    status ENUM('pending', 'approved', 'delivered') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);

-- QC and GRN
CREATE TABLE grn (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_id INT NOT NULL,
    items JSON NOT NULL,
    qc_status ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id)
);

CREATE TABLE qc_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    grn_id INT,
    production_id INT,
    results JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grn_id) REFERENCES grn(id)
);

-- Inventory
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_code VARCHAR(100) UNIQUE NOT NULL,
    batch VARCHAR(100),
    rack VARCHAR(50),
    shelf VARCHAR(50),
    quantity INT NOT NULL DEFAULT 0,
    qr_code VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    type ENUM('in', 'out') NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

-- Production
CREATE TABLE root_cards (
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
);

CREATE TABLE manufacturing_stages (
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
);

CREATE TABLE worker_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stage_id INT NOT NULL,
    worker_id INT NOT NULL,
    task VARCHAR(500) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    logs JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES manufacturing_stages(id),
    FOREIGN KEY (worker_id) REFERENCES users(id)
);

-- Challans
CREATE TABLE outward_challans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challan_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INT NOT NULL,
    items JSON NOT NULL,
    vendor_id INT,
    status ENUM('pending', 'dispatched', 'received') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE inward_challans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challan_number VARCHAR(50) UNIQUE NOT NULL,
    outward_challan_id INT NOT NULL,
    items JSON NOT NULL,
    qc_status ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (outward_challan_id) REFERENCES outward_challans(id)
);

-- Notifications and Audit
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reports
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(100) NOT NULL,
    data JSON NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_inventory_item_code ON inventory(item_code);
CREATE INDEX idx_manufacturing_stages_status ON manufacturing_stages(status);
CREATE INDEX idx_root_cards_status ON root_cards(status);
CREATE INDEX idx_root_cards_project ON root_cards(project_id);
CREATE INDEX idx_manufacturing_stages_assigned ON manufacturing_stages(assigned_worker);
CREATE INDEX idx_worker_tasks_status ON worker_tasks(status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_status);