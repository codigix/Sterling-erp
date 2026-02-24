const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    
    // Find the root card by exact title match
    const [rcs] = await conn.execute(
      "SELECT id, title FROM root_cards WHERE title LIKE '%ASHM Load Simulation%' ORDER BY id DESC LIMIT 5"
    );
    console.log('Found Root Cards:');
    rcs.forEach(rc => console.log(`  ID: ${rc.id}, Title: "${rc.title}"`));
    
    // Check documents for each
    for (const rc of rcs) {
      console.log(`\n--- Root Card ID ${rc.id} (${rc.title}) ---`);
      
      const [dwgs] = await conn.execute(
        'SELECT id, name, root_card_id, status FROM drawings WHERE root_card_id = ?',
        [rc.id]
      );
      console.log(`  Drawings: ${dwgs.length}`);
      dwgs.forEach(d => console.log(`    - ${d.name}`));
      
      const [specs] = await conn.execute(
        'SELECT id, title, root_card_id, status FROM specifications WHERE root_card_id = ?',
        [rc.id]
      );
      console.log(`  Specifications: ${specs.length}`);
      specs.forEach(s => console.log(`    - ${s.title}`));
    }
    
    conn.release();
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
})();
