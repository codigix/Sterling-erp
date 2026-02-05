const pool = require('./config/database');
const ProductionPlan = require('./models/ProductionPlan');
const ProductionPlanDetail = require('./models/ProductionPlanDetail');
const WorkOrder = require('./models/WorkOrder');
const ComprehensiveBOM = require('./models/ComprehensiveBOM');

async function testRootCardCentricFlow() {
  const connection = await pool.getConnection();
  try {
    console.log('=== Testing Root Card Centric Flow (No Sales Order) ===\n');
    await connection.beginTransaction();

    // 1. Create a dummy Root Card without a Sales Order
    console.log('1. Creating a test Root Card without Sales Order...');
    const [rcResult] = await connection.execute(
      `INSERT INTO root_cards (code, title, project_id, status) VALUES (?, ?, ?, ?)`,
      ['TEST-RC-101', 'Test Root Card', 1, 'planning']
    );
    const rootCardId = rcResult.insertId;
    console.log(`   ✅ Root Card created: ID=${rootCardId}`);

    // 2. Create a Production Plan for this Root Card
    console.log('\n2. Creating Production Plan for Root Card...');
    const planId = await ProductionPlan.create({
      rootCardId: rootCardId,
      planName: `Plan for Root Card ${rootCardId}`,
      status: 'draft',
      plannedStartDate: '2026-02-01',
      plannedEndDate: '2026-02-28'
    }, connection);
    console.log(`   ✅ Production Plan created: ID=${planId}`);

    // 3. Create Production Plan Details
    console.log('\n3. Creating Production Plan Details...');
    const detailData = {
      rootCardId: rootCardId,
      timeline: { productionStartDate: '2026-02-05', estimatedCompletionDate: '2026-02-25' },
      finishedGoods: [
        { itemCode: 'FG-001', productName: 'Finished Good 1', plannedQty: 10 }
      ],
      subAssemblies: [
        { itemCode: 'SA-001', itemName: 'Sub Assembly 1', requiredQty: 5 }
      ]
    };
    const detailId = await ProductionPlanDetail.create(detailData);
    console.log(`   ✅ Production Plan Details created: ID=${detailId}`);

    // 4. Verify Retrieval via Model
    console.log('\n4. Verifying retrieval via models...');
    const retrievedPlan = await ProductionPlan.findById(planId);
    if (retrievedPlan && retrievedPlan.root_card_id === rootCardId) {
      console.log('   ✅ ProductionPlan.findById retrieved correct root_card_id');
    } else {
      console.log('   ❌ ProductionPlan.findById failed to retrieve correct root_card_id');
    }

    const retrievedDetail = await ProductionPlanDetail.findByRootCardId(rootCardId);
    if (retrievedDetail && retrievedDetail.rootCardId === rootCardId) {
      console.log('   ✅ ProductionPlanDetail.findByRootCardId retrieved correct root_card_id');
    } else {
      console.log('   ❌ ProductionPlanDetail.findByRootCardId failed');
    }

    // 5. Test Work Order generation logic (mocked logic or call model directly)
    console.log('\n5. Creating a Work Order for this Root Card...');
    const woId = await WorkOrder.create({
      workOrderNo: 'WO-TEST-101',
      rootCardId: rootCardId,
      itemCode: 'FG-001',
      itemName: 'Finished Good 1',
      quantity: 10,
      status: 'planning'
    }, connection);
    console.log(`   ✅ Work Order created: ID=${woId}`);

    const retrievedWO = await WorkOrder.findById(woId);
    if (retrievedWO && retrievedWO.root_card_id === rootCardId) {
       console.log('   ✅ WorkOrder.findById retrieved correct root_card_id');
       console.log(`      Linked to: ${retrievedWO.sales_order_no}`);
    } else {
       console.log('   ❌ WorkOrder.findById failed');
    }

    await connection.rollback();
    console.log('\n=== Test Complete (Rolled Back) ===\n');
  } catch (error) {
    console.error('❌ Error during test:', error);
    await connection.rollback();
  } finally {
    connection.release();
    process.exit(0);
  }
}

testRootCardCentricFlow();
