const pool = require('../config/database');

async function migrate() {
  try {
    console.log('Adding target_quantity to production_plans...');
    await pool.execute('ALTER TABLE production_plans ADD COLUMN target_quantity DECIMAL(10, 4) DEFAULT 1.0000 AFTER bom_id');
    console.log('Migration successful');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column already exists');
      process.exit(0);
    }
    console.error(err);
    process.exit(1);
  }
}

migrate();
