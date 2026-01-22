const { up } = require('./backend/migrations/051_reindex_root_card_steps');

async function run() {
  try {
    await up();
    console.log('Migration successful');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
