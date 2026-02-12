const pool = require("./config/database");

async function checkSchema() {
  try {
    const [rows] = await pool.query("DESCRIBE warehouses");
    console.log("Warehouse Table Schema:");
    console.table(rows);
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log("Table 'warehouses' does not exist.");
    } else {
      console.error("Error checking schema:", error.message);
    }
  } finally {
    process.exit();
  }
}

checkSchema();
