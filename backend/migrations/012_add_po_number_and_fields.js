const pool = require('../config/database');

async function addPoNumberToOrdersAndFields() {
  const connection = await pool.getConnection();

  try {
    console.log("Adding po_number and additional fields to purchase_orders table...");

    try {
      await connection.execute(`
        ALTER TABLE purchase_orders 
        ADD COLUMN po_number VARCHAR(50) UNIQUE NOT NULL AFTER id,
        ADD COLUMN vendor_id INT NULL AFTER quotation_id,
        ADD COLUMN total_amount DECIMAL(15, 2) DEFAULT 0 AFTER items,
        ADD COLUMN expected_delivery_date DATE NULL AFTER total_amount,
        ADD COLUMN notes TEXT NULL AFTER expected_delivery_date
      `);
      console.log("✅ po_number, vendor_id, total_amount, expected_delivery_date, and notes columns added");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️ One or more columns already exist");
      } else {
        throw error;
      }
    }

    console.log("✅ Purchase Orders table updated successfully");
  } catch (error) {
    console.error("❌ Error updating purchase_orders table:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

addPoNumberToOrdersAndFields()
  .then(() => {
    console.log("✅ Migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
