const pool = require('../config/database');

async function createPurchaseOrdersTable() {
  const connection = await pool.getConnection();

  try {
    console.log("Creating/Updating purchase_orders table...");

    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS purchase_orders (
          id INT PRIMARY KEY AUTO_INCREMENT,
          po_number VARCHAR(50) UNIQUE NOT NULL,
          quotation_id INT NOT NULL,
          vendor_id INT NULL,
          items JSON NOT NULL,
          total_amount DECIMAL(15, 2) DEFAULT 0,
          expected_delivery_date DATE NULL,
          notes TEXT NULL,
          status ENUM('pending', 'approved', 'delivered') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
          FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
        )
      `);
      console.log("✅ purchase_orders table created/verified");
    } catch (error) {
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        console.log("⚠️ purchase_orders table already exists");
        
        console.log("Verifying po_number column...");
        try {
          await connection.execute(`
            ALTER TABLE purchase_orders 
            ADD COLUMN po_number VARCHAR(50) UNIQUE NOT NULL AFTER id
          `);
          console.log("✅ po_number column added");
        } catch (e) {
          if (e.code === "ER_DUP_FIELDNAME") {
            console.log("⚠️ po_number column already exists");
          }
        }

        console.log("Verifying vendor_id column...");
        try {
          await connection.execute(`
            ALTER TABLE purchase_orders 
            ADD COLUMN vendor_id INT NULL AFTER quotation_id
          `);
          console.log("✅ vendor_id column added");
        } catch (e) {
          if (e.code === "ER_DUP_FIELDNAME") {
            console.log("⚠️ vendor_id column already exists");
          }
        }

        console.log("Verifying total_amount column...");
        try {
          await connection.execute(`
            ALTER TABLE purchase_orders 
            ADD COLUMN total_amount DECIMAL(15, 2) DEFAULT 0 AFTER items
          `);
          console.log("✅ total_amount column added");
        } catch (e) {
          if (e.code === "ER_DUP_FIELDNAME") {
            console.log("⚠️ total_amount column already exists");
          }
        }

        console.log("Verifying expected_delivery_date column...");
        try {
          await connection.execute(`
            ALTER TABLE purchase_orders 
            ADD COLUMN expected_delivery_date DATE NULL AFTER total_amount
          `);
          console.log("✅ expected_delivery_date column added");
        } catch (e) {
          if (e.code === "ER_DUP_FIELDNAME") {
            console.log("⚠️ expected_delivery_date column already exists");
          }
        }

        console.log("Verifying notes column...");
        try {
          await connection.execute(`
            ALTER TABLE purchase_orders 
            ADD COLUMN notes TEXT NULL AFTER expected_delivery_date
          `);
          console.log("✅ notes column added");
        } catch (e) {
          if (e.code === "ER_DUP_FIELDNAME") {
            console.log("⚠️ notes column already exists");
          }
        }
      } else {
        throw error;
      }
    }

    console.log("✅ Purchase Orders table ready");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

createPurchaseOrdersTable()
  .then(() => {
    console.log("✅ Migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
