const migration = require('./migrations/074_add_root_card_id_to_employee_tasks');

migration()
  .then(() => {
    console.log('Migration 074 completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration 074 failed:', err);
    process.exit(1);
  });
