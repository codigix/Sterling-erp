const QualityCheckDetail = require('./models/QualityCheckDetail');
const ShipmentDetail = require('./models/ShipmentDetail');
const DeliveryDetail = require('./models/DeliveryDetail');
const pool = require('./config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function verifyComprehensivePersistence() {
  try {
    console.log('Verifying comprehensive data persistence for Root Card Steps 5-7 using Models...\n');

    const rootCardId = 6; // Using existing ID for testing

    // 1. Test Step 5 - Quality Check
    console.log('--- Testing Step 5 (Quality Check) Model ---');
    const step5Data = {
      rootCardId,
      // ... same data ...
    };

    let detail5 = await QualityCheckDetail.findByRootCardId(rootCardId);
    if (detail5) {
      await QualityCheckDetail.update(rootCardId, step5Data);
    } else {
      step5Data.rootCardId = rootCardId;
      await QualityCheckDetail.create(step5Data);
    }
    console.log('✅ Step 5 Model save successful');

    // 2. Test Step 6 - Shipment
    console.log('\n--- Testing Step 6 (Shipment) Model ---');
    const step6Data = {
      rootCardId,
      // ... same data ...
    };

    let detail6 = await ShipmentDetail.findByRootCardId(rootCardId);
    if (detail6) {
      await ShipmentDetail.update(rootCardId, step6Data);
    } else {
      step6Data.rootCardId = rootCardId;
      await ShipmentDetail.create(step6Data);
    }
    console.log('✅ Step 6 Model save successful');

    // 3. Test Step 7 - Delivery
    console.log('\n--- Testing Step 7 (Delivery) Model ---');
    const step7Data = {
      rootCardId,
      // ... same data ...
    };

    let detail7 = await DeliveryDetail.findByRootCardId(rootCardId);
    if (detail7) {
      await DeliveryDetail.update(rootCardId, step7Data);
    } else {
      step7Data.rootCardId = rootCardId;
      await DeliveryDetail.create(step7Data);
    }
    console.log('✅ Step 7 Model save successful');

    // 4. Verify in Database
    console.log('\n--- Verifying Data in Database ---');
    
    // Check QC
    const qc = await QualityCheckDetail.findByRootCardId(rootCardId);
    console.log('QC Details in DB (formatted):', {
      qualityStandards: qc.qualityCompliance.qualityStandards,
      qcStatus: qc.qualityCheck.qcStatus,
      inspectedBy: qc.inspectedBy,
      internalProjectOwner: qc.internalProjectOwner
    });

    // Check Shipment
    const shipment = await ShipmentDetail.findByRootCardId(rootCardId);
    console.log('Shipment Details in DB (formatted):', {
      shipmentMethod: shipment.shipmentMethod,
      carrierName: shipment.carrierName,
      notes: shipment.notes
    });

    // Check Delivery
    const delivery = await DeliveryDetail.findByRootCardId(rootCardId);
    console.log('Delivery Details in DB (formatted):', {
      actualDeliveryDate: delivery.delivery.actualDeliveryDate,
      customerContact: delivery.delivery.customerContact,
      podNumber: delivery.podNumber,
      assignedTo: delivery.assignedTo
    });

    await pool.end();
    console.log('\n✨ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyComprehensivePersistence();
