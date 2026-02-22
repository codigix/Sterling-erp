const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function checkSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'sterling_erp'
    });

    console.log('\n📋 root_cards table columns:');
    const [rootCardsCols] = await connection.execute('DESCRIBE root_cards');
    rootCardsCols.forEach(col => {
      console.log(`   ${col.Field} (${col.Type})`);
    });

    console.log('\n📋 root_cards sample data:');
    const [rootCards] = await connection.execute('SELECT * FROM root_cards LIMIT 3');
    if (rootCards.length > 0) {
      Object.keys(rootCards[0]).forEach(key => {
        console.log(`   ${key}: ${rootCards[0][key]}`);
      });
    }

    console.log('\n📋 drawings table columns:');
    const [drawingsCols] = await connection.execute('DESCRIBE drawings');
    drawingsCols.forEach(col => {
      console.log(`   ${col.Field} (${col.Type})`);
    });

    console.log('\n📋 specifications table columns:');
    const [specsCols] = await connection.execute('DESCRIBE specifications');
    specsCols.forEach(col => {
      console.log(`   ${col.Field} (${col.Type})`);
    });

    console.log('\n📊 Document counts:');
    const [[{drawingCount}]] = await connection.execute('SELECT COUNT(*) as drawingCount FROM drawings');
    const [[{specCount}]] = await connection.execute('SELECT COUNT(*) as specCount FROM specifications');
    console.log(`   Drawings: ${drawingCount}`);
    console.log(`   Specifications: ${specCount}`);

    console.log('\n📊 Documents with root_card_id:');
    const [[{drawingsWithRcId}]] = await connection.execute('SELECT COUNT(*) as drawingsWithRcId FROM drawings WHERE root_card_id IS NOT NULL');
    const [[{specsWithRcId}]] = await connection.execute('SELECT COUNT(*) as specsWithRcId FROM specifications WHERE root_card_id IS NOT NULL');
    console.log(`   Drawings with root_card_id: ${drawingsWithRcId}`);
    console.log(`   Specifications with root_card_id: ${specsWithRcId}`);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

checkSchema();
