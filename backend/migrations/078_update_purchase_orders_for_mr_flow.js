const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    console.log('Updating purchase_orders table for MR flow...');

    // 1. Make quotation_id nullable
    await connection.execute(`
      ALTER TABLE purchase_orders 
      MODIFY COLUMN quotation_id INT NULL
    `);

    // 2. Add material_request_id
    try {
      await connection.execute(`
        ALTER TABLE purchase_orders 
        ADD COLUMN material_request_id INT NULL AFTER quotation_id,
        ADD CONSTRAINT fk_po_material_request FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE SET NULL
      `);
      console.log('✅ material_request_id column and constraint added');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ material_request_id column already exists');
      } else {
        throw e;
      }
    }

    // 3. Add order_date, currency, tax_template, subtotal, tax_amount
    const columns = [
      { name: 'order_date', type: 'DATE NULL AFTER expected_delivery_date' },
      { name: 'currency', type: "VARCHAR(10) DEFAULT 'INR' AFTER order_date" },
      { name: 'tax_template', type: 'VARCHAR(100) NULL AFTER currency' },
      { name: 'subtotal', type: 'DECIMAL(15, 2) DEFAULT 0 AFTER total_amount' },
      { name: 'tax_amount', type: 'DECIMAL(15, 2) DEFAULT 0 AFTER subtotal' }
    ];

    for (const col of columns) {
      try {
        await connection.execute(`ALTER TABLE purchase_orders ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ ${col.name} column added`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ ${col.name} column already exists`);
        } else {
          throw e;
        }
      }
    }

    await connection.query('COMMIT');
    console.log('✅ Purchase Orders table updated successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error updating table:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });