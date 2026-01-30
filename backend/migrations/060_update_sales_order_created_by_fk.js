const pool = require("../config/database");

async function updateSalesManagementForeignKey() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    console.log("Updating sales_orders_management created_by foreign key...");

    // Drop existing foreign key
    try {
      await connection.execute(`
        ALTER TABLE sales_orders_management 
        DROP FOREIGN KEY sales_orders_management_ibfk_4
      `);
      console.log("Dropped old foreign key constraint");
    } catch (e) {
      console.log("Foreign key might not exist or has different name:", e.message);
    }

    // Add new foreign key referencing users table
    await connection.execute(`
      ALTER TABLE sales_orders_management 
      ADD CONSTRAINT sales_orders_management_created_by_fk 
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    `);

    console.log("✅ sales_orders_management foreign key updated to reference users table");

  } catch (error) {
    console.error("Error updating foreign key:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
  updateSalesManagementForeignKey()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { updateSalesManagementForeignKey };
