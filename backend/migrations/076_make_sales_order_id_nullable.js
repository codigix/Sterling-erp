const pool = require('../config/database');

async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    console.log('Allowing NULL for sales_order_id in material_requests...');

    // 1. Drop existing foreign key first
    try {
      await connection.execute('ALTER TABLE material_requests DROP FOREIGN KEY material_requests_ibfk_1');
    } catch (e) {
      console.log('FK already dropped or named differently');
    }

    // 2. Modify column to be nullable
    await connection.execute(`
      ALTER TABLE material_requests 
      MODIFY COLUMN sales_order_id INT NULL
    `);

    // 3. Re-add foreign key with SET NULL on delete if we want to keep it, 
    // or just leave it nullable without strict FK if preferred.
    // Given the environment, SET NULL is safer.
    await connection.execute(`
      ALTER TABLE material_requests 
      ADD CONSTRAINT fk_mr_sales_order 
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) 
      ON DELETE SET NULL
    `);

    await connection.query('COMMIT');
    console.log('✅ material_requests.sales_order_id is now nullable');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
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
