
-- Delivery Details Table (updated to match frontend requirements)
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
);

-- Add index for delivery status
CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery_details(delivery_status);
