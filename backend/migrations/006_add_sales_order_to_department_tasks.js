const pool = require('../config/database');

async function addSalesOrderIdToDepartmentTasks() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding sales_order_id column to department_tasks...');
    
    await connection.execute(`
      ALTER TABLE department_tasks 
      ADD COLUMN sales_order_id INT DEFAULT NULL
    `);
    
    console.log('✅ Successfully added sales_order_id column to department_tasks');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  sales_order_id column already exists');
    } else {
      console.error('❌ Error adding sales_order_id column:', error.message);
      throw error;
    }
  } finally {
    connection.release();
  }
}

addSalesOrderIdToDepartmentTasks()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
