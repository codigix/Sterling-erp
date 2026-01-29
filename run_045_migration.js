const { createComprehensiveBOMTables } = require("./backend/migrations/045_create_comprehensive_bom_tables");

async function run() {
  try {
    await createComprehensiveBOMTables();
    console.log("Migration 045 completed");
  } catch (err) {
    console.error("Migration 045 failed:", err);
  } finally {
    process.exit();
  }
}

run();
