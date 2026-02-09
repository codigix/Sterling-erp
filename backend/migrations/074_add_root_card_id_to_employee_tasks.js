const pool = require('../config/database');

async function addRootCardIdToEmployeeTasks() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    console.log('Adding root_card_id column to employee_tasks table...');

    try {
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD COLUMN root_card_id INT
      `);
      console.log('✅ root_card_id column added to employee_tasks table');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') {
        throw err;
      }
      console.log('⚠️  root_card_id column already exists');
    }

    try {
      await connection.execute(`
        ALTER TABLE employee_tasks 
        ADD FOREIGN KEY (root_card_id) REFERENCES root_cards(id) ON DELETE SET NULL
      `);
      console.log('✅ Foreign key constraint added for root_card_id');
    } catch (err) {
      console.log('⚠️  Foreign key constraint already exists or could not be added');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = addRootCardIdToEmployeeTasks;
