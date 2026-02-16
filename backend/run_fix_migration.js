const migration = require('./migrations/082_update_grn_table.js');
migration.up().then(() => {
    console.log('Migration successful');
    process.exit(0);
}).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});