const pool = require('./config/database');

async function listRootCards() {
  try {
    const [rows] = await pool.execute('SELECT id, title FROM root_cards ORDER BY id DESC');
    
    console.log('\n=== ALL ROOT CARDS ===\n');
    rows.forEach(r => {
      console.log(`Root Card ID: ${r.id} -> ${r.title}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listRootCards();
