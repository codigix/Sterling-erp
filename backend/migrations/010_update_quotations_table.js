const pool = require("../config/database");

async function updateQuotationsTable() {
  const connection = await pool.getConnection();

  try {
    console.log("Updating quotations table...");

    // Add type column
    try {
      await connection.execute(`
        ALTER TABLE quotations 
        ADD COLUMN type ENUM('outbound', 'inbound') NOT NULL DEFAULT 'outbound'
      `);
      console.log("✅ type column added");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️ type column already exists");
      } else {
        throw error;
      }
    }

    // Add reference_id column
    try {
      await connection.execute(`
        ALTER TABLE quotations 
        ADD COLUMN reference_id INT NULL
      `);
      console.log("✅ reference_id column added");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️ reference_id column already exists");
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

updateQuotationsTable()
  .then(() => {
    console.log("✅ Migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
