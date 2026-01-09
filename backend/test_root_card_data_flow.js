const pool = require('./config/database');
const RootCard = require('./models/RootCard');

async function testRootCardDataFlow() {
  const connection = await pool.getConnection();
  try {
    console.log('=== Testing Root Card Data Flow ===\n');
    
    console.log('1. Checking RootCard.findById() return values...');
    const [testCards] = await connection.execute(
      `SELECT id, sales_order_id FROM root_cards LIMIT 1`
    );
    
    if (testCards.length > 0) {
      const testId = testCards[0].id;
      console.log(`   Found test root card ID: ${testId}`);
      
      const rootCard = await RootCard.findById(testId);
      if (rootCard) {
        console.log('   ✅ RootCard retrieved successfully');
        console.log(`   - Title: ${rootCard.title}`);
        console.log(`   - Sales Order ID: ${rootCard.sales_order_id}`);
        console.log(`   - Project ID: ${rootCard.project_id}`);
        console.log(`   - Project Name: ${rootCard.project_name}`);
        console.log(`   - Status: ${rootCard.status}`);
      } else {
        console.log('   ❌ RootCard not found');
      }
    } else {
      console.log('   ⚠️  No root cards in database');
    }
    
    console.log('\n2. Checking ProductionPlan structure...');
    const [ppSchema] = await connection.execute('DESC production_plans');
    const hasRootCardId = ppSchema.some(col => col.Field === 'root_card_id');
    console.log(hasRootCardId ? '   ✅ root_card_id column exists' : '   ❌ root_card_id column missing');
    
    console.log('\n3. Checking ManufacturingStages...');
    const [stageSchema] = await connection.execute('DESC manufacturing_stages');
    const hasRootCardRef = stageSchema.some(col => col.Field === 'root_card_id');
    console.log(hasRootCardRef ? '   ✅ root_card_id column in manufacturing_stages' : '   ❌ root_card_id missing in stages');
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    connection.release();
    process.exit(0);
  }
}

testRootCardDataFlow();
