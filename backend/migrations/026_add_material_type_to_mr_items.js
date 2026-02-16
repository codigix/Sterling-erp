const pool = require('../config/database');

async function migrate() {
  try {
    console.log('Adding material_type column to material_request_items...');
    await pool.execute('ALTER TABLE material_request_items ADD COLUMN material_type VARCHAR(100) AFTER material_code');
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column material_type already exists.');
      process.exit(0);
    }
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
