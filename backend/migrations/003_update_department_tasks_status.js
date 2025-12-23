const pool = require('../config/database');

async function updateDepartmentTasksStatus() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Updating department_tasks status ENUM to include draft...');
    
    await connection.execute(`
      ALTER TABLE department_tasks 
      CHANGE COLUMN status status ENUM('draft', 'pending', 'in_progress', 'completed', 'on_hold') DEFAULT 'draft'
    `);
    
    console.log('✅ Successfully updated department_tasks status ENUM');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_SAME_NAME_PARTITION') {
      console.log('⚠️  Status ENUM already updated');
    } else {
      console.error('❌ Error updating status ENUM:', error.message);
      throw error;
    }
  } finally {
    connection.release();
  }
}

updateDepartmentTasksStatus()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
