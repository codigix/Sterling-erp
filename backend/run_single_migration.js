const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const migration = require('./migrations/1013_create_production_plan_fg_table.js');

async function run() {
    try {
        await migration.up();
        console.log('Migration successfully executed');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
