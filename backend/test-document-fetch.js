const pool = require('./config/database');

async function testDocumentFetch() {
  try {
    console.log('\n=== TESTING DOCUMENT FETCH FOR ROOT CARD ID 21 ===\n');
    
    // Test 1: Fetch drawings for root card 21
    console.log('TEST 1: Fetch Drawings for Root Card ID 21');
    const [drawings] = await pool.execute(
      `SELECT d.* FROM drawings d 
       LEFT JOIN root_cards rc ON d.root_card_id = rc.id
       WHERE d.root_card_id = ?
       ORDER BY d.created_at DESC`,
      [21]
    );
    
    console.log(`Found ${drawings.length} drawings:`);
    drawings.forEach(d => {
      console.log(`  - ID: ${d.id}, Name: ${d.name}, Root Card ID: ${d.root_card_id}`);
    });
    
    // Test 2: Fetch specifications for root card 21
    console.log('\nTEST 2: Fetch Specifications for Root Card ID 21');
    const [specs] = await pool.execute(
      `SELECT s.* FROM specifications s 
       WHERE s.root_card_id = ?
       ORDER BY s.created_at DESC`,
      [21]
    );
    
    console.log(`Found ${specs.length} specifications:`);
    specs.forEach(s => {
      console.log(`  - ID: ${s.id}, Title: ${s.title}, Root Card ID: ${s.root_card_id}`);
    });
    
    // Test 3: Verify root card exists
    console.log('\nTEST 3: Verify Root Card 21 Exists');
    const [rootCards] = await pool.execute(
      'SELECT id, title FROM root_cards WHERE id = ?',
      [21]
    );
    
    if (rootCards.length > 0) {
      console.log(`✓ Root Card found: ID ${rootCards[0].id} - ${rootCards[0].title}`);
    } else {
      console.log('✗ Root Card 21 NOT FOUND');
    }
    
    // Test 4: Check all root cards with documents
    console.log('\nTEST 4: All Root Cards with Documents');
    const [allRCs] = await pool.execute(`
      SELECT DISTINCT rc.id, rc.title,
        (SELECT COUNT(*) FROM drawings WHERE root_card_id = rc.id) as drawing_count,
        (SELECT COUNT(*) FROM specifications WHERE root_card_id = rc.id) as spec_count
      FROM root_cards rc
      ORDER BY rc.id DESC
    `);
    
    allRCs.forEach(rc => {
      if (rc.drawing_count > 0 || rc.spec_count > 0) {
        console.log(`  Root Card ${rc.id} (${rc.title}): ${rc.drawing_count} drawings, ${rc.spec_count} specs`);
      }
    });
    
    console.log('\n=== TEST COMPLETE ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDocumentFetch();
