const pool = require('./backend/config/database');

async function updateSchema() {
  try {
    console.log('Adding missing columns...');
    
    // Add inspection_type
    try {
      await pool.execute('ALTER TABLE quality_check_details ADD COLUMN inspection_type VARCHAR(100) AFTER qc_status');
      console.log('Added inspection_type');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMNNAME') console.log('inspection_type already exists');
      else throw e;
    }

    // Add inspections (JSON)
    try {
      await pool.execute('ALTER TABLE quality_check_details ADD COLUMN inspections JSON AFTER inspection_type');
      console.log('Added inspections');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMNNAME') console.log('inspections already exists');
      else throw e;
    }

    console.log('Schema update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateSchema();
