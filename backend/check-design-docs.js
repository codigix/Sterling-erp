const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function checkDesignDocs() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'sterling_erp'
    });

    console.log('\n🔍 Checking Design Documents...\n');

    // Check root_cards table
    const [rootCards] = await connection.execute('SELECT id, title FROM root_cards LIMIT 10');
    console.log('📋 Root Cards:');
    rootCards.forEach(rc => console.log(`   - ID: ${rc.id}, Title: ${rc.title}`));

    // Check drawings table
    console.log('\n📐 Drawings Table:');
    const [drawingsCols] = await connection.execute('DESCRIBE drawings');
    console.log('   Columns:', drawingsCols.map(c => c.Field).join(', '));

    const [drawings] = await connection.execute('SELECT id, root_card_id, name, status FROM drawings LIMIT 10');
    console.log(`   Total rows: ${drawings.length}`);
    if (drawings.length > 0) {
      drawings.forEach(d => console.log(`   - ID: ${d.id}, root_card_id: ${d.root_card_id}, name: ${d.name}, status: ${d.status}`));
    }

    // Check specifications table
    console.log('\n📄 Specifications Table:');
    const [specsCols] = await connection.execute('DESCRIBE specifications');
    console.log('   Columns:', specsCols.map(c => c.Field).join(', '));

    const [specs] = await connection.execute('SELECT id, root_card_id, title, status FROM specifications LIMIT 10');
    console.log(`   Total rows: ${specs.length}`);
    if (specs.length > 0) {
      specs.forEach(s => console.log(`   - ID: ${s.id}, root_card_id: ${s.root_card_id}, title: ${s.title}, status: ${s.status}`));
    }

    // Count documents per root card
    console.log('\n📊 Documents per Root Card:');
    const [counts] = await connection.execute(`
      SELECT rc.id, rc.title, 
        (SELECT COUNT(*) FROM drawings WHERE root_card_id = rc.id) as drawing_count,
        (SELECT COUNT(*) FROM specifications WHERE root_card_id = rc.id) as spec_count
      FROM root_cards rc
      ORDER BY rc.id
    `);

    counts.forEach(row => {
      const total = (row.drawing_count || 0) + (row.spec_count || 0);
      if (total > 0) {
        console.log(`   Root Card ${row.id} (${row.title}): ${row.drawing_count || 0} drawings, ${row.spec_count || 0} specs`);
      }
    });

    connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) connection.end();
    process.exit(1);
  }
}

checkDesignDocs();
