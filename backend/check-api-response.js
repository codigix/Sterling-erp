const pool = require('./config/database');

async function checkAPIResponse() {
  try {
    // Check what /production/root-cards returns
    const [rows] = await pool.execute(`
      SELECT rc.id, rc.title, rc.project_id, 
             p.name as project_name
      FROM root_cards rc
      LEFT JOIN projects p ON rc.project_id = p.id
      ORDER BY rc.id DESC
    `);
    
    console.log('\n=== ROOT CARDS API RESPONSE (What Design Documents Page Gets) ===\n');
    rows.forEach(r => {
      console.log(`ID: ${r.id}`);
      console.log(`  Title: ${r.title}`);
      console.log(`  Project ID: ${r.project_id}`);
      console.log(`  Project Name: ${r.project_name}`);
      console.log('');
    });
    
    console.log('\n=== FILTERING BY ROOT CARD ID ===\n');
    
    // For each root card, show its documents
    for (const rc of rows.slice(0, 5)) {
      const [drawings] = await pool.execute(
        'SELECT COUNT(*) as count FROM drawings WHERE root_card_id = ?',
        [rc.id]
      );
      const [specs] = await pool.execute(
        'SELECT COUNT(*) as count FROM specifications WHERE root_card_id = ?',
        [rc.id]
      );
      
      console.log(`Root Card ${rc.id} (${rc.title}): ${drawings[0].count} drawings, ${specs[0].count} specs`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAPIResponse();
