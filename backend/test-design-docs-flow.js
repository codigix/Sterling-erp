const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function testFlow() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'sterling_erp',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0
    });

    console.log('\n✅ Connected to database\n');

    // Test 1: Check root_cards table
    console.log('1️⃣  Checking root_cards table...');
    const [rootCards] = await connection.execute(
      'SELECT id, title, customer, po_number, project_name FROM root_cards LIMIT 5'
    );
    console.log(`   Found ${rootCards.length} root cards`);
    rootCards.forEach((rc, i) => {
      const name = rc.title || rc.project_name || rc.po_number || `#${rc.id}`;
      console.log(`   ${i + 1}. ID:${rc.id} - ${name}`);
    });

    // Test 2: Check documents linked to root cards
    console.log('\n2️⃣  Checking drawings per root card...');
    const [drawingCounts] = await connection.execute(`
      SELECT root_card_id, COUNT(*) as count 
      FROM drawings 
      WHERE root_card_id IS NOT NULL 
      GROUP BY root_card_id
    `);
    if (drawingCounts.length > 0) {
      drawingCounts.forEach(row => {
        console.log(`   Root Card ${row.root_card_id}: ${row.count} drawings`);
      });
    } else {
      console.log('   ❌ No drawings found with root_card_id');
    }

    // Test 3: Check specifications linked to root cards
    console.log('\n3️⃣  Checking specifications per root card...');
    const [specCounts] = await connection.execute(`
      SELECT root_card_id, COUNT(*) as count 
      FROM specifications 
      WHERE root_card_id IS NOT NULL 
      GROUP BY root_card_id
    `);
    if (specCounts.length > 0) {
      specCounts.forEach(row => {
        console.log(`   Root Card ${row.root_card_id}: ${row.count} specifications`);
      });
    } else {
      console.log('   ❌ No specifications found with root_card_id');
    }

    // Test 4: Simulate API call - fetch root cards
    console.log('\n4️⃣  Simulating /sales/root-cards API call...');
    const [apiRootCards] = await connection.execute(`
      SELECT so.*, p.id as project_id, p.code as project_code 
      FROM sales_orders so
      LEFT JOIN projects p ON p.sales_order_id = so.id
      ORDER BY so.created_at DESC
      LIMIT 5
    `);
    console.log(`   API would return ${apiRootCards.length} root cards`);
    apiRootCards.forEach((rc, i) => {
      const name = rc.po_number || rc.customer || `#${rc.id}`;
      console.log(`   ${i + 1}. ID:${rc.id} - ${name}`);
    });

    // Test 5: Check if any root card IDs match between root_cards and drawings
    console.log('\n5️⃣  Checking ID matching...');
    const [allRootCards] = await connection.execute('SELECT DISTINCT id FROM root_cards');
    const [allDrawingRootCardIds] = await connection.execute('SELECT DISTINCT root_card_id FROM drawings');
    const [allSpecRootCardIds] = await connection.execute('SELECT DISTINCT root_card_id FROM specifications');
    
    const rcIds = new Set(allRootCards.map(r => r.id));
    const drawingIds = new Set(allDrawingRootCardIds.map(d => d.root_card_id).filter(Boolean));
    const specIds = new Set(allSpecRootCardIds.map(s => s.root_card_id).filter(Boolean));
    
    console.log(`   Root cards table has ${rcIds.size} unique IDs`);
    console.log(`   Drawings table has ${drawingIds.size} unique root_card_ids`);
    console.log(`   Specifications table has ${specIds.size} unique root_card_ids`);
    
    const matchingDrawings = Array.from(drawingIds).filter(id => rcIds.has(id));
    const matchingSpecs = Array.from(specIds).filter(id => rcIds.has(id));
    
    console.log(`   ✅ ${matchingDrawings.length} drawing root_card_ids match root_cards`);
    if (matchingDrawings.length > 0) {
      console.log(`      Root card IDs: ${matchingDrawings.join(', ')}`);
    }
    console.log(`   ✅ ${matchingSpecs.length} specification root_card_ids match root_cards`);
    if (matchingSpecs.length > 0) {
      console.log(`      Root card IDs: ${matchingSpecs.join(', ')}`);
    }

    await connection.end();
    console.log('\n✅ Test complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

testFlow();
