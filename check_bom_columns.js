const pool = require("./backend/config/database");

async function checkColumns() {
  try {
    const [rows] = await pool.execute("DESCRIBE bill_of_materials");
    console.log("Columns in bill_of_materials:");
    console.table(rows);

    const [materialsRows] = await pool.execute("DESCRIBE bom_materials");
    console.log("\nColumns in bom_materials:");
    console.table(materialsRows);

    const [componentsRows] = await pool.execute("DESCRIBE bom_components");
    console.log("\nColumns in bom_components:");
    console.table(componentsRows);

    const [scrapRows] = await pool.execute("DESCRIBE bom_scrap_loss");
    console.log("\nColumns in bom_scrap_loss:");
    console.table(scrapRows);

    const [opsRows] = await pool.execute("DESCRIBE bom_operations");
    console.log("\nColumns in bom_operations:");
    console.table(opsRows);
  } catch (error) {
    console.error("Error checking columns:", error.message);
  } finally {
    process.exit();
  }
}

checkColumns();
