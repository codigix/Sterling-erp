const pool = require("../config/database");

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log("Checking if type column exists in work_order_operations table...");
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'work_order_operations' 
      AND COLUMN_NAME = 'type' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    if (columns.length === 0) {
      console.log("Adding type column to work_order_operations table...");
      await connection.execute(`
        ALTER TABLE work_order_operations 
        ADD COLUMN type ENUM('in-house', 'outsource') DEFAULT 'in-house' AFTER workstation
      `);
      console.log("✓ Added type column to work_order_operations");
    } else {
      console.log("type column already exists in work_order_operations table");
    }

    await connection.commit();
    console.log("Migration completed successfully.");
  } catch (error) {
    await connection.rollback();
    console.error("Error during migration:", error);
    throw error;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = migrate;
