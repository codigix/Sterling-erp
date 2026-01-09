const pool = require('./config/database');
const ProductionPlan = require('./models/ProductionPlan');
const RootCard = require('./models/RootCard');
const ManufacturingStage = require('./models/ManufacturingStage');

async function testProductionPlanCreation() {
  const connection = await pool.getConnection();
  try {
    console.log('=== Testing Production Plan Creation with Root Card ===\n');
    
    await connection.beginTransaction();
    
    console.log('1. Finding a test root card with sales order...');
    const [rootCards] = await connection.execute(
      `SELECT rc.id, rc.sales_order_id, rc.title, rc.project_id 
       FROM root_cards rc 
       WHERE rc.sales_order_id IS NOT NULL 
       LIMIT 1`
    );
    
    if (rootCards.length === 0) {
      console.log('   ⚠️  No root cards with sales_order_id found');
      await connection.rollback();
      process.exit(0);
    }
    
    const rootCardId = rootCards[0].id;
    const salesOrderId = rootCards[0].sales_order_id;
    const rootCardTitle = rootCards[0].title;
    
    console.log(`   ✅ Found root card: ID=${rootCardId}, SO=${salesOrderId}, Title="${rootCardTitle}"`);
    
    console.log('\n2. Creating test production plan with root_card_id...');
    const planId = await ProductionPlan.create({
      salesOrderId: salesOrderId,
      rootCardId: rootCardId,
      planName: `Test Plan for RC ${rootCardId}`,
      status: 'draft',
      plannedStartDate: new Date(),
      plannedEndDate: new Date(Date.now() + 30*24*60*60*1000),
      notes: 'Test production plan with root card'
    }, connection);
    
    console.log(`   ✅ Production plan created: ID=${planId}`);
    
    console.log('\n3. Verifying production plan data in database...');
    const [plans] = await connection.execute(
      `SELECT id, sales_order_id, root_card_id, plan_name, status 
       FROM production_plans 
       WHERE id = ?`,
      [planId]
    );
    
    if (plans.length > 0) {
      const plan = plans[0];
      console.log(`   ✅ Plan retrieved from DB:`);
      console.log(`      - ID: ${plan.id}`);
      console.log(`      - Sales Order ID: ${plan.sales_order_id}`);
      console.log(`      - Root Card ID: ${plan.root_card_id}`);
      console.log(`      - Name: ${plan.plan_name}`);
      console.log(`      - Status: ${plan.status}`);
      
      if (plan.root_card_id === rootCardId) {
        console.log('   ✅ root_card_id correctly saved!');
      } else {
        console.log(`   ❌ root_card_id mismatch! Expected ${rootCardId}, got ${plan.root_card_id}`);
      }
    } else {
      console.log('   ❌ Plan not found in database');
    }
    
    console.log('\n4. Testing ProductionPlan.findById()...');
    const retrievedPlan = await ProductionPlan.findById(planId);
    if (retrievedPlan) {
      console.log(`   ✅ Plan retrieved via model:`);
      console.log(`      - ID: ${retrievedPlan.id}`);
      console.log(`      - root_card_id: ${retrievedPlan.root_card_id}`);
      console.log(`      - customer_name: ${retrievedPlan.customer_name}`);
    } else {
      console.log('   ❌ Plan not found via model');
    }
    
    console.log('\n5. Fetching manufacturing stages for root card...');
    const stages = await ManufacturingStage.findByRootCardIds([rootCardId]);
    console.log(`   ✅ Found ${stages.length} manufacturing stages for root card ${rootCardId}`);
    if (stages.length > 0) {
      stages.slice(0, 2).forEach((stage, idx) => {
        console.log(`      Stage ${idx+1}: ${stage.stage_name} (${stage.status})`);
      });
    }
    
    await connection.rollback();
    console.log('\n=== Test Complete (Rolled Back) ===\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError.message);
    }
  } finally {
    connection.release();
    process.exit(0);
  }
}

testProductionPlanCreation();
