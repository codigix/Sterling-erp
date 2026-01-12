const migration = require('./migrations/035_create_alerts_notifications_table.js');

migration()
  .then(() => {
    console.log('✓ Migration 035 completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Migration 035 failed:', err.message);
    process.exit(1);
  });
