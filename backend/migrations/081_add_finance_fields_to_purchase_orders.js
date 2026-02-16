const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    console.log('Adding finance and terms fields to purchase_orders table...');

    const columns = [
      { name: 'payment_terms', type: 'TEXT NULL' },
      { name: 'payment_due_date', type: 'DATE NULL' },
      { name: 'tax_rate', type: 'DECIMAL(5, 2) DEFAULT 18.00' },
      { name: 'advance_paid', type: 'DECIMAL(15, 2) DEFAULT 0.00' },
      { name: 'payable_balance', type: 'DECIMAL(15, 2) DEFAULT 0.00' }
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
