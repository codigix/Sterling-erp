const { up } = require('./backend/migrations/052_reindex_drafts');

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
