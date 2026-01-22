const pool = require('./config/database');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runFullSystemCheck() {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + '🔍 FULL ROOT CARD SYSTEM CHECK' + ' '.repeat(28) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('');

  let checksPassed = 0;
  let checksFailed = 0;

  // Check 1: Database Connection
  console.log('1️⃣  Database Connection');
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('   ✅ Connected to database\n');
    checksPassed++;
  } catch (error) {
    console.log(`   ❌ Failed to connect: ${error.message}\n`);
    checksFailed++;
    console.log('   💡 Make sure MySQL is running and credentials in .env are correct\n');
  }

  // Check 2: Required Tables
  console.log('2️⃣  Database Tables');
  const tables = [
    'sales_orders', 'client_po_details', 'sales_order_details',
    'design_engineering_details', 'material_requirements_details',
    'production_plan_details', 'quality_check_details',
    'shipment_details', 'delivery_details', 'projects', 'root_cards'
  ];
  
  let allTablesExist = true;
  for (const table of tables) {
    try {
      const [result] = await pool.execute(
        `SELECT COUNT(*) as cnt FROM ${table} LIMIT 1`
      );
      process.stdout.write(`   ✅ ${table.padEnd(35)}`);
    } catch (error) {
      console.log(`   ❌ ${table.padEnd(35)}`);
      allTablesExist = false;
    }
    // Count rows
    try {
      const [count] = await pool.execute(`SELECT COUNT(*) as cnt FROM ${table}`);
      console.log(`(${count[0].cnt} rows)`);
    } catch {
      console.log('');
    }
  }
  
  if (allTablesExist) {
    console.log('   ✅ All required tables exist\n');
    checksPassed++;
  } else {
    console.log('\n   ❌ Some tables are missing\n');
    checksFailed++;
    console.log('   💡 Run: node backend/initDb.js\n');
  }

  // Check 3: API Endpoints Exist
  console.log('3️⃣  API Endpoints (checking files)');
  const requiredEndpoints = [
    { file: 'rootCardStepsRoutes.js', endpoint: '/client-po' },
    { file: 'rootCardStepsRoutes.js', endpoint: '/root-card-details' },
    { file: 'rootCardStepsRoutes.js', endpoint: '/design-engineering' },
    { file: 'rootCardStepsRoutes.js', endpoint: '/material-requirements' },
    { file: 'rootCardStepsRoutes.js', endpoint: '/production-plan' },
    { file: 'rootCardStepsRoutes.js', endpoint: '/quality-check' },
    { file: 'rootCardStepsRoutes.js', endpoint: '/shipment' },
    { file: 'rootCardStepsRoutes.js', endpoint: '/delivery' },
  ];

  let allEndpointsExist = true;
  for (const ep of requiredEndpoints) {
    const filepath = path.join(__dirname, 'routes', 'root-cards', ep.file);
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      if (content.includes(ep.endpoint)) {
        console.log(`   ✅ ${ep.endpoint}`);
      } else {
        console.log(`   ❌ ${ep.endpoint} - not found in routes`);
        allEndpointsExist = false;
      }
    } catch (error) {
      console.log(`   ❌ ${ep.endpoint} - file not found at ${filepath}`);
      allEndpointsExist = false;
    }
  }
  
  if (allEndpointsExist) {
    console.log('   ✅ All API endpoints defined\n');
    checksPassed++;
  } else {
    console.log('\n   ⚠️  Some endpoint definitions may be missing\n');
    checksFailed++;
  }

  // Check 4: Controllers Exist
  console.log('4️⃣  Controllers');
  const controllers = [
    'clientPOController.js',
    'rootCardDetailController.js',
    'designEngineeringController.js',
    'materialRequirementsController.js',
    'productionPlanController.js',
    'qualityCheckController.js',
    'shipmentController.js',
    'deliveryController.js'
  ];

  let allControllersExist = true;
  for (const controller of controllers) {
    const filepath = path.join(__dirname, 'controllers', 'root-cards', controller);
    try {
      fs.accessSync(filepath);
      console.log(`   ✅ ${controller}`);
    } catch {
      console.log(`   ❌ ${controller} - not found at ${filepath}`);
      allControllersExist = false;
    }
  }
  
  if (allControllersExist) {
    console.log('   ✅ All controllers exist\n');
    checksPassed++;
  } else {
    console.log('\n   ⚠️  Some controllers are missing\n');
    checksFailed++;
  }

  // Check 5: Models Exist
  console.log('5️⃣  Models');
  const models = [
    'ClientPODetail.js',
    'SalesOrderDetail.js',
    'DesignEngineeringDetail.js',
    'MaterialRequirementsDetail.js',
    'ProductionPlanDetail.js',
    'QualityCheckDetail.js',
    'ShipmentDetail.js',
    'DeliveryDetail.js',
    'RootCard.js',
    'Project.js'
  ];

  let allModelsExist = true;
  for (const model of models) {
    const filepath = path.join(__dirname, 'models', model);
    try {
      fs.accessSync(filepath);
      console.log(`   ✅ ${model}`);
    } catch {
      console.log(`   ❌ ${model}`);
      allModelsExist = false;
    }
  }
  
  if (allModelsExist) {
    console.log('   ✅ All models exist\n');
    checksPassed++;
  } else {
    console.log('\n   ⚠️  Some models are missing\n');
    checksFailed++;
  }

  // Check 6: Sample Data
  console.log('6️⃣  Sample Data');
  try {
    const [salesOrders] = await pool.execute('SELECT COUNT(*) as cnt FROM sales_orders');
    const [rootCards] = await pool.execute('SELECT COUNT(*) as cnt FROM root_cards');
    const [projects] = await pool.execute('SELECT COUNT(*) as cnt FROM projects');
    
    console.log(`   Sales Orders: ${salesOrders[0].cnt}`);
    console.log(`   Root Cards: ${rootCards[0].cnt}`);
    console.log(`   Projects: ${projects[0].cnt}`);
    
    if (salesOrders[0].cnt > 0) {
      console.log('\n   ✅ Sample data exists\n');
      checksPassed++;
    } else {
      console.log('\n   ⚠️  No sample data found\n');
      console.log('   💡 Create a sales order first via the frontend\n');
    }
  } catch (error) {
    console.log(`   ❌ Error checking sample data\n`);
    checksFailed++;
  }

  // Summary
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(25) + '📊 SUMMARY' + ' '.repeat(43) + '║');
  console.log('╚' + '═'.repeat(78) + '╝\n');

  console.log(`   ✅ Passed: ${checksPassed}`);
  console.log(`   ❌ Failed: ${checksFailed}`);
  console.log(`   📊 Total: ${checksPassed + checksFailed}`);

  if (checksFailed === 0) {
    console.log('\n   🎉 All checks passed! System is ready.\n');
  } else {
    console.log('\n   ⚠️  Some checks failed. See above for details.\n');
    console.log('   💡 Next Steps:');
    console.log('      1. Run: node backend/initDb.js');
    console.log('      2. Start backend: npm start (in backend directory)');
    console.log('      3. Start frontend: npm run dev (in frontend directory)');
    console.log('      4. Create a new sales order');
    console.log('      5. Run: node backend/verify-data-persistence.js <salesOrderId>\n');
  }

  console.log('═'.repeat(80) + '\n');

  await pool.end();
  process.exit(checksFailed > 0 ? 1 : 0);
}

runFullSystemCheck().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
