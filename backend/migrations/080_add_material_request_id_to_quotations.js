const pool = require("../config/database");

async function addMaterialRequestIdToQuotations() {
  const connection = await pool.getConnection();

  try {
    console.log("Adding material_request_id to quotations table...");

    try {
      await connection.execute(`
        ALTER TABLE quotations 
        ADD COLUMN material_request_id INT NULL,
        ADD CONSTRAINT fk_quotation_material_request 
        FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE SET NULL
      `);
      console.log("✅ material_request_id column and FK added");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("⚠️ material_request_id column already exists");
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

addMaterialRequestIdToQuotations()
  .then(() => {
    console.log("✅ Migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
