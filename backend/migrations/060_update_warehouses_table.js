const pool = require("../config/database");

async function updateWarehousesTable() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    console.log("Updating warehouses table...");

    // Add missing columns
    await connection.execute(`
      ALTER TABLE warehouses 
      ADD COLUMN type VARCHAR(50) AFTER code,
      ADD COLUMN department VARCHAR(100) AFTER type,
      ADD COLUMN storage_capacity DECIMAL(15, 2) AFTER location,
      ADD COLUMN parent_warehouse_id INT NULL AFTER storage_capacity,
      ADD CONSTRAINT fk_parent_warehouse FOREIGN KEY (parent_warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL
    `);

    console.log("✅ warehouses table updated successfully");

  } catch (error) {
    console.error("Error updating warehouses table:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

updateWarehousesTable()
  .then(() => {
    console.log("Migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
