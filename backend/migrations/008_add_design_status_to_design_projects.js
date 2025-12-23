const pool = require('../config/database');

async function addDesignStatusColumn() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding design_status column to design_projects table...');
    
    await connection.execute(`
      ALTER TABLE design_projects 
      ADD COLUMN design_status VARCHAR(50) DEFAULT 'draft' AFTER status
    `);
    
    console.log('✅ design_status column added successfully');
    
  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('⚠️ design_status column already exists');
    } else {
      console.error('❌ Error adding design_status column:', error.message);
      throw error;
    }
  } finally {
    connection.release();
  }
}

addDesignStatusColumn()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
