-- Shipment Details Table (updated to match frontend requirements)
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
);

-- Add index for shipment details table
CREATE INDEX IF NOT EXISTS idx_shipment_status ON shipment_details(shipment_status);
