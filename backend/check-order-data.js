require('dotenv').config();
const pool = require('./config/database');

(async () => {
  try {
    // Get sales order ID for PO-001
    const [orders] = await pool.execute(
      'SELECT id, po_number, customer FROM sales_orders WHERE po_number = ?',
      ['PO-001']
    );
    
    if (orders.length === 0) {
      console.log('❌ No order found with PO number: PO-001');
      process.exit(1);
    }
    
    const soId = orders[0].id;
    console.log('\n' + '='.repeat(80));
    console.log('📋 DATA VERIFICATION FOR PO-001 (Sales Order ID: ' + soId + ')');
    console.log('='.repeat(80) + '\n');
    
    // Check Step 1: Client PO Details
    const [po] = await pool.execute(
      'SELECT * FROM client_po_details WHERE sales_order_id = ?',
      [soId]
    );
    console.log('✅ STEP 1 - Client PO Details:', po.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (po.length > 0) {
      const record = po[0];
      console.log('   PO Number:', record.po_number);
      console.log('   Client Name:', record.client_name);
      console.log('   Project Name:', record.project_name);
      console.log('   Billing Address:', record.billing_address);
      console.log('   Project Requirements (JSON):', record.project_requirements ? '✅ STORED' : '❌ EMPTY');
      if (record.project_requirements) {
        try {
          const req = typeof record.project_requirements === 'string' 
            ? JSON.parse(record.project_requirements) 
            : record.project_requirements;
          console.log('   └─ Contains keys:', Object.keys(req).join(', '));
        } catch (e) {
          console.log('   └─ JSON Parse Error:', e.message);
        }
      }
    }
    
    // Check Step 2: Sales Order Details
    const [sod] = await pool.execute(
      'SELECT * FROM sales_order_details WHERE sales_order_id = ?',
      [soId]
    );
    console.log('\n✅ STEP 2 - Sales Order Details:', sod.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (sod.length > 0) {
      const record = sod[0];
      console.log('   Client Email:', record.client_email);
      console.log('   Estimated End Date:', record.estimated_end_date);
      console.log('   Total Amount:', record.total_amount);
      console.log('   Payment Terms:', record.payment_terms);
      console.log('   Product Details (JSON):', record.product_details ? '✅ STORED' : '❌ EMPTY');
      if (record.product_details) {
        try {
          const prod = typeof record.product_details === 'string' 
            ? JSON.parse(record.product_details) 
            : record.product_details;
          console.log('   └─ Contains keys:', Object.keys(prod).join(', '));
        } catch (e) {
          console.log('   └─ JSON Parse Error:', e.message);
        }
      }
      console.log('   Quality Compliance (JSON):', record.quality_compliance ? '✅ STORED' : '❌ EMPTY');
      if (record.quality_compliance) {
        try {
          const qual = typeof record.quality_compliance === 'string' 
            ? JSON.parse(record.quality_compliance) 
            : record.quality_compliance;
          console.log('   └─ Contains keys:', Object.keys(qual).join(', '));
        } catch (e) {
          console.log('   └─ JSON Parse Error:', e.message);
        }
      }
      console.log('   Warranty Support (JSON):', record.warranty_support ? '✅ STORED' : '❌ EMPTY');
    }
    
    // Check Step 3-8
    const [design] = await pool.execute('SELECT * FROM design_engineering_details WHERE sales_order_id = ?', [soId]);
    console.log('\n✅ STEP 3 - Design Engineering:', design.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (design.length > 0) {
      const record = design[0];
      console.log('   Design Status:', record.design_status);
      console.log('   Documents:', record.documents ? '✅ STORED' : '❌ EMPTY');
    }
    
    const [materials] = await pool.execute('SELECT * FROM material_requirements_details WHERE sales_order_id = ?', [soId]);
    console.log('\n✅ STEP 4 - Material Requirements:', materials.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (materials.length > 0) {
      const record = materials[0];
      console.log('   Materials (JSON):', record.materials ? '✅ STORED' : '❌ EMPTY');
      if (record.materials) {
        try {
          const mats = typeof record.materials === 'string' 
            ? JSON.parse(record.materials) 
            : record.materials;
          console.log('   └─ Material Count:', Array.isArray(mats) ? mats.length : 'Not an array');
        } catch (e) {
          console.log('   └─ JSON Parse Error:', e.message);
        }
      }
      console.log('   Total Cost:', record.total_material_cost);
      console.log('   Procurement Status:', record.procurement_status);
    }
    
    const [production] = await pool.execute('SELECT * FROM production_plan_details WHERE sales_order_id = ?', [soId]);
    console.log('\n✅ STEP 5 - Production Plan:', production.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (production.length > 0) {
      const record = production[0];
      console.log('   Timeline (JSON):', record.timeline ? '✅ STORED' : '❌ EMPTY');
      console.log('   Selected Phases (JSON):', record.selected_phases ? '✅ STORED' : '❌ EMPTY');
      console.log('   Prod. Notes:', record.production_notes || '(empty)');
    }
    
    const [quality] = await pool.execute('SELECT * FROM quality_check_details WHERE sales_order_id = ?', [soId]);
    console.log('\n✅ STEP 6 - Quality Check:', quality.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (quality.length > 0) {
      const record = quality[0];
      console.log('   QC Status:', record.qc_status);
      console.log('   Quality Standards:', record.quality_standards);
      console.log('   Warranty Period:', record.warranty_period);
    }
    
    const [shipment] = await pool.execute('SELECT * FROM shipment_details WHERE sales_order_id = ?', [soId]);
    console.log('\n✅ STEP 7 - Shipment:', shipment.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (shipment.length > 0) {
      const record = shipment[0];
      console.log('   Shipment Status:', record.shipment_status);
      console.log('   Delivery Schedule:', record.delivery_schedule);
      console.log('   Packaging Info:', record.packaging_info);
    }
    
    const [delivery] = await pool.execute('SELECT * FROM delivery_details WHERE sales_order_id = ?', [soId]);
    console.log('\n✅ STEP 8 - Delivery:', delivery.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (delivery.length > 0) {
      const record = delivery[0];
      console.log('   Delivery Status:', record.delivery_status);
      console.log('   Actual Delivery Date:', record.actual_delivery_date);
      console.log('   Delivered To:', record.customer_contact);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
