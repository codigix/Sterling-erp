const migration = require('./migrations/026_fix_production_plan_stages_fk.js');

migration()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch(e => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  });
