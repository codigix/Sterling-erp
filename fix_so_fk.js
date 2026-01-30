const pool = require('./backend/config/database');
async function migrate() {
  try {
    console.log('Dropping old foreign key...');
    await pool.execute('ALTER TABLE sales_orders_management DROP FOREIGN KEY sales_orders_management_ibfk_5');
    
    console.log('Adding new foreign key pointing to sales_orders...');
    await pool.execute('ALTER TABLE sales_orders_management ADD CONSTRAINT sales_orders_management_root_card_fk FOREIGN KEY (root_card_id) REFERENCES sales_orders(id) ON DELETE CASCADE');
    
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}
migrate();
