const pool = require('./config/database');
const { up } = require('./migrations/017_create_grn_table');

async function runMyMigration() {
  try {
    console.log('Running 017_create_grn_table migration...');
    await up();
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

runMyMigration();
