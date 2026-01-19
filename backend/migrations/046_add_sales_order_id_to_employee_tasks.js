const pool = require('../config/database');

async function addSalesOrderIdToEmployeeTasks() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    console.log('Adding sales_order_id column to employee_tasks table...');

    try {
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD COLUMN sales_order_id INT
      `);
      console.log('✅ sales_order_id column added to employee_tasks table');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        throw err;
      }
      console.log('⚠️  sales_order_id column already exists');
    }

    try {
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL
      `);
      console.log('✅ Foreign key constraint added for sales_order_id');
    } catch (err) {
      console.log('⚠️  Foreign key constraint already exists or could not be added');
    }
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = addSalesOrderIdToEmployeeTasks;
