const pool = require("../config/database");

async function createSalesManagementTable() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    console.log("Creating sales_orders_management table...");

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales_orders_management (
        id INT PRIMARY KEY AUTO_INCREMENT,
        bom_id INT NOT NULL,
        so_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(12, 4) NOT NULL,
        order_date DATE NOT NULL,
        delivery_date DATE NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES employees(id),
        INDEX idx_bom_id (bom_id),
        INDEX idx_status (status)
      )
    `);
    console.log("✅ sales_orders_management table created/verified");

  } catch (error) {
    console.error("Error creating sales_orders_management table:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = { createSalesManagementTable };
