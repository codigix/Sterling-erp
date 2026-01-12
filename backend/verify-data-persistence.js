const pool = require('./config/database');
require('dotenv').config();

async function checkDataPersistence(salesOrderId) {
  if (!salesOrderId) {
    console.error('❌ Usage: node verify-data-persistence.js <salesOrderId>');
    process.exit(1);
  }

  console.log(`\n📋 Data Persistence Check for Sales Order ID: ${salesOrderId}\n`);
  console.log('='.repeat(80));

  try {
    // Check Sales Order exists
    console.log('\n1️⃣  Checking Sales Order...');
    const [salesOrders] = await pool.execute(
      'SELECT id, customer, po_number, order_date, total FROM sales_orders WHERE id = ?',
      [salesOrderId]
    );
    if (salesOrders.length === 0) {
      console.log('   ❌ Sales Order not found');
      process.exit(1);
    }
    const so = salesOrders[0];
    console.log(`   ✅ Sales Order Found`);
    console.log(`      - Customer: ${so.customer}`);
    console.log(`      - PO Number: ${so.po_number}`);
    console.log(`      - Total: ${so.total}`);

    // Check Root Card
    console.log('\n2️⃣  Checking Root Card...');
    const [rootCards] = await pool.execute(
      'SELECT id, project_id, code, title, status FROM root_cards WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (rootCards.length === 0) {
      console.log('   ⚠️  No Root Card found (should be auto-created)');
    } else {
      const rc = rootCards[0];
      console.log(`   ✅ Root Card Found`);
      console.log(`      - ID: ${rc.id}`);
      console.log(`      - Code: ${rc.code}`);
      console.log(`      - Title: ${rc.title}`);
      console.log(`      - Status: ${rc.status}`);
    }

    // Check Project
    console.log('\n3️⃣  Checking Project...');
    const [projects] = await pool.execute(
      'SELECT id, name, code, status FROM projects WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (projects.length === 0) {
      console.log('   ⚠️  No Project found');
    } else {
      const proj = projects[0];
      console.log(`   ✅ Project Found`);
      console.log(`      - ID: ${proj.id}`);
      console.log(`      - Name: ${proj.name}`);
      console.log(`      - Code: ${proj.code}`);
    }

    // Check Step 1: Client PO Details
    console.log('\n4️⃣  Checking Step 1: Client PO Details...');
    const [clientPO] = await pool.execute(
      'SELECT id, po_number, client_name, project_name, billing_address FROM client_po_details WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (clientPO.length === 0) {
      console.log('   ❌ No Client PO details found');
    } else {
      const po = clientPO[0];
      console.log(`   ✅ Client PO Details Found`);
      console.log(`      - PO Number: ${po.po_number}`);
      console.log(`      - Client: ${po.client_name}`);
      console.log(`      - Project: ${po.project_name}`);
      console.log(`      - Billing Address: ${po.billing_address ? '✓' : '✗'}`);
    }

    // Check Step 2: Sales Order Details
    console.log('\n5️⃣  Checking Step 2: Sales Order Details...');
    const [salesOrderDetails] = await pool.execute(
      'SELECT id, client_email, estimated_end_date, total_amount, project_priority FROM sales_order_details WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (salesOrderDetails.length === 0) {
      console.log('   ❌ No Sales Order details found');
    } else {
      const sod = salesOrderDetails[0];
      console.log(`   ✅ Sales Order Details Found`);
      console.log(`      - Email: ${sod.client_email}`);
      console.log(`      - Est. End Date: ${sod.estimated_end_date}`);
      console.log(`      - Total Amount: ${sod.total_amount}`);
      console.log(`      - Priority: ${sod.project_priority}`);
    }

    // Check Step 3: Design Engineering
    console.log('\n6️⃣  Checking Step 3: Design Engineering Details...');
    const [designDtls] = await pool.execute(
      'SELECT id, created_at FROM design_engineering_details WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (designDtls.length === 0) {
      console.log('   ❌ No Design Engineering details found');
    } else {
      console.log(`   ✅ Design Engineering Details Found`);
      console.log(`      - Record ID: ${designDtls[0].id}`);
      console.log(`      - Created: ${designDtls[0].created_at}`);
    }

    // Check Step 4: Material Requirements
    console.log('\n7️⃣  Checking Step 4: Material Requirements Details...');
    const [matReqs] = await pool.execute(
      'SELECT id, total_material_cost FROM material_requirements_details WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (matReqs.length === 0) {
      console.log('   ❌ No Material Requirements found');
    } else {
      console.log(`   ✅ Material Requirements Details Found`);
      console.log(`      - Record ID: ${matReqs[0].id}`);
      console.log(`      - Total Cost: ${matReqs[0].total_material_cost}`);
    }

    // Check Step 5: Production Plan
    console.log('\n8️⃣  Checking Step 5: Production Plan Details...');
    const [prodPlans] = await pool.execute(
      'SELECT id, planned_start_date, planned_end_date FROM production_plan_details WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (prodPlans.length === 0) {
      console.log('   ❌ No Production Plan found');
    } else {
      console.log(`   ✅ Production Plan Details Found`);
      console.log(`      - Record ID: ${prodPlans[0].id}`);
      console.log(`      - Start Date: ${prodPlans[0].planned_start_date}`);
      console.log(`      - End Date: ${prodPlans[0].planned_end_date}`);
    }

    // Check Step 6: Quality Check
    console.log('\n9️⃣  Checking Step 6: Quality Check Details...');
    const [qcDtls] = await pool.execute(
      'SELECT id FROM quality_check_details WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (qcDtls.length === 0) {
      console.log('   ❌ No Quality Check details found');
    } else {
      console.log(`   ✅ Quality Check Details Found`);
      console.log(`      - Record ID: ${qcDtls[0].id}`);
    }

    // Check Step 7: Shipment
    console.log('\n🔟 Checking Step 7: Shipment Details...');
    const [shipDtls] = await pool.execute(
      'SELECT id FROM shipment_details WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (shipDtls.length === 0) {
      console.log('   ❌ No Shipment details found');
    } else {
      console.log(`   ✅ Shipment Details Found`);
      console.log(`      - Record ID: ${shipDtls[0].id}`);
    }

    // Check Step 8: Delivery
    console.log('\n1️⃣1️⃣  Checking Step 8: Delivery Details...');
    const [delivDtls] = await pool.execute(
      'SELECT id FROM delivery_details WHERE sales_order_id = ?',
      [salesOrderId]
    );
    if (delivDtls.length === 0) {
      console.log('   ❌ No Delivery details found');
    } else {
      console.log(`   ✅ Delivery Details Found`);
      console.log(`      - Record ID: ${delivDtls[0].id}`);
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    const completedSteps = [
      clientPO.length > 0,
      salesOrderDetails.length > 0,
      designDtls.length > 0,
      matReqs.length > 0,
      prodPlans.length > 0,
      qcDtls.length > 0,
      shipDtls.length > 0,
      delivDtls.length > 0
    ];
    
    const completed = completedSteps.filter(s => s).length;
    console.log(`\n📊 SUMMARY: ${completed}/8 steps have data saved`);
    
    if (completed === 8) {
      console.log('\n✅ All steps have data! Data persistence is working correctly.');
    } else {
      console.log('\n⚠️  Missing data in steps:', 
        completedSteps
          .map((val, idx) => val ? null : (idx + 1))
          .filter(v => v !== null)
          .join(', ')
      );
      console.log('\n💡 Make sure you:');
      console.log('   1. Fill out all form fields for each step');
      console.log('   2. Click Next/Save button to save each step');
      console.log('   3. Check browser DevTools Network tab for API errors');
      console.log('   4. Check backend logs for database errors');
    }

    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run check
const salesOrderId = process.argv[2];
checkDataPersistence(salesOrderId);
