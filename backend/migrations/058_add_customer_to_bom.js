const pool = require("../config/database");

async function addCustomerToBOM() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'bill_of_materials' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    const columnNames = columns.map((c) => c.COLUMN_NAME);

    if (!columnNames.includes("customer")) {
      await connection.execute(
        "ALTER TABLE bill_of_materials ADD COLUMN customer VARCHAR(255) AFTER item_code"
      );
      console.log("✓ Added customer column to bill_of_materials");
    }

    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("Error adding customer column to BOM:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
  addCustomerToBOM()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { addCustomerToBOM };
