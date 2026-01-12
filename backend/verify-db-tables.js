const pool = require('./config/database');
require('dotenv').config();

async function verifyDatabaseTables() {
  console.log('\n🔍 Verifying Database Tables and Schema\n');
  console.log('='.repeat(80));

  const requiredTables = [
    { name: 'sales_orders', step: 'Root' },
    { name: 'client_po_details', step: 1 },
    { name: 'sales_order_details', step: 2 },
    { name: 'design_engineering_details', step: 3 },
    { name: 'material_requirements_details', step: 4 },
    { name: 'production_plan_details', step: 5 },
    { name: 'quality_check_details', step: 6 },
    { name: 'shipment_details', step: 7 },
    { name: 'delivery_details', step: 8 },
    { name: 'projects', step: 'Root' },
    { name: 'root_cards', step: 'Root' },
  ];

  let allTablesExist = true;

  for (const table of requiredTables) {
    try {
      const [result] = await pool.execute(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [table.name]
      );

      if (result.length > 0) {
        console.log(`✅ Step ${table.step}: Table '${table.name}' exists`);
        
        // Check row count
        const [count] = await pool.execute(`SELECT COUNT(*) as cnt FROM ${table.name}`);
        console.log(`   └─ Rows: ${count[0].cnt}`);
      } else {
        console.log(`❌ Step ${table.step}: Table '${table.name}' is MISSING`);
        allTablesExist = false;
      }
    } catch (error) {
      console.log(`❌ Step ${table.step}: Error checking '${table.name}': ${error.message}`);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(80));

  if (allTablesExist) {
    console.log('\n✅ All required tables exist! Database schema is correct.\n');
  } else {
    console.log('\n❌ Some tables are missing! Run database initialization:\n');
    console.log('   node backend/initDb.js\n');
    console.log('Or run migrations:');
    console.log('   node backend/runMigrations.js\n');
  }

  // Additional checks
  console.log('='.repeat(80));
  console.log('\n📊 Database Info:');

  try {
    const [dbInfo] = await pool.execute('SELECT DATABASE() as db_name');
    console.log(`   Database Name: ${dbInfo[0].db_name}`);

    const [tables] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()`
    );
    console.log(`   Total Tables: ${tables[0].cnt}`);

    const [users] = await pool.execute('SELECT COUNT(*) as cnt FROM users');
    console.log(`   Users Created: ${users[0].cnt}`);
  } catch (error) {
    console.log(`   Error getting database info: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  await pool.end();
  process.exit(allTablesExist ? 0 : 1);
}

verifyDatabaseTables().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
