const pool = require('../config/database');

async function addTargetWarehouseToManufacturingStages() {
  let connection = null;
  try {
    connection = await pool.getConnection();

    console.log('Checking for target_warehouse column in manufacturing_stages...');

    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'manufacturing_stages' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    
    if (!columnNames.includes('target_warehouse')) {
      console.log('Adding target_warehouse column to manufacturing_stages...');
      await connection.execute('ALTER TABLE manufacturing_stages ADD COLUMN target_warehouse VARCHAR(255) AFTER notes');
      console.log('✅ target_warehouse column added successfully to manufacturing_stages');
    } else {
      console.log('ℹ target_warehouse column already exists in manufacturing_stages');
    }

  } catch (error) {
    console.error('Error updating manufacturing_stages table:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

if (require.main === module) {
  addTargetWarehouseToManufacturingStages()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { addTargetWarehouseToManufacturingStages };
