const pool = require('./config/database');

async function checkSchema() {
  const connection = await pool.getConnection();
  try {
    console.log('Checking production_plans table schema...\n');
    const [columns] = await connection.execute('DESC production_plans');
    
    console.log('Production Plans Table Structure:');
    console.log('================================');
    columns.forEach(col => {
      const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
      const key = col.Key ? ` [${col.Key}]` : '';
      console.log(`  ${col.Field.padEnd(25)} ${col.Type.padEnd(30)} ${nullable}${key}`);
    });
    
    console.log('\nChecking root_card_id column specifically:');
    const rootCardCol = columns.find(c => c.Field === 'root_card_id');
    if (rootCardCol) {
      console.log('✅ root_card_id column EXISTS');
      console.log(`   Type: ${rootCardCol.Type}`);
      console.log(`   Nullable: ${rootCardCol.Null}`);
      console.log(`   Key: ${rootCardCol.Key || 'None'}`);
    } else {
      console.log('❌ root_card_id column NOT FOUND');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

checkSchema();
