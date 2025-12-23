const pool = require('../config/database');

async function addDesignDetailsColumn() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding design_details column to sales_orders table...');
    
    await connection.execute(`
      ALTER TABLE sales_orders 
      ADD COLUMN design_details JSON DEFAULT NULL
    `);
    
    console.log('✅ design_details column added successfully');
    
  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('⚠️ design_details column already exists');
    } else {
      console.error('❌ Error adding design_details column:', error.message);
      throw error;
    }
  } finally {
    connection.release();
  }
}

addDesignDetailsColumn()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
