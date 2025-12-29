const pool = require("../config/database");

async function addSalesOrderIdToQuotations() {
  const connection = await pool.getConnection();

  try {
    console.log("Adding sales_order_id to quotations table...");

    try {
      await connection.execute(`
        ALTER TABLE quotations 
        ADD COLUMN sales_order_id INT NULL
      `);
      console.log("✅ sales_order_id column added");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️ sales_order_id column already exists");
      } else {
        throw error;
      }
    }

    console.log("✅ Quotations table updated successfully");
  } catch (error) {
    console.error("❌ Error updating quotations table:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

addSalesOrderIdToQuotations()
  .then(() => {
    console.log("✅ Migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
