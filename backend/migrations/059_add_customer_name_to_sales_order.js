const pool = require("../config/database");

async function addCustomerNameToSalesOrder() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'sales_orders_management' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    const columnNames = columns.map((c) => c.COLUMN_NAME);

    if (!columnNames.includes("customer_name")) {
      await connection.execute(
        "ALTER TABLE sales_orders_management ADD COLUMN customer_name VARCHAR(255) AFTER so_number"
      );
      console.log("✓ Added customer_name column to sales_orders_management");
    }
    
    // Also make customer_id optional if it was required
    await connection.execute(
      "ALTER TABLE sales_orders_management MODIFY COLUMN customer_id INT NULL"
    );

    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("Error adding customer_name column to Sales Order Management:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
  addCustomerNameToSalesOrder()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { addCustomerNameToSalesOrder };
