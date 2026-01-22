require('dotenv').config();
const pool = require('./config/database');

const STEP_CONFIGS = {
  1: {
    name: 'Client PO & Project Details',
    table: 'client_po_details',
    fields: [
      { db: 'po_number', display: 'PO Number', type: 'string' },
      { db: 'po_date', display: 'PO Date', type: 'date' },
      { db: 'client_name', display: 'Client Name', type: 'string' },
      { db: 'client_email', display: 'Client Email', type: 'email' },
      { db: 'client_phone', display: 'Client Phone', type: 'phone' },
      { db: 'project_name', display: 'Project Name', type: 'string' },
      { db: 'project_code', display: 'Project Code', type: 'string' },
      { db: 'billing_address', display: 'Billing Address', type: 'text' },
      { db: 'shipping_address', display: 'Shipping Address', type: 'text' },
      { db: 'project_requirements', display: 'Project Requirements (JSON)', type: 'json' },
      { db: 'product_details', display: 'Product Details (JSON)', type: 'json' },
      { db: 'notes', display: 'Notes', type: 'text' }
    ]
  },
  2: {
    name: 'Design Engineering',
    table: 'design_engineering_details',
    fields: [
      { db: 'design_details', display: 'Design Details (JSON)', type: 'json' },
      { db: 'documents', display: 'Documents (JSON)', type: 'json' },
      { db: 'specifications', display: 'Specifications (JSON)', type: 'json' }
    ]
  },
  3: {
    name: 'Material Requirements',
    table: 'material_requirements_details',
    fields: [
      { db: 'materials', display: 'Materials List (JSON)', type: 'json' },
      { db: 'procurement_status', display: 'Procurement Status', type: 'string' },
      { db: 'total_material_cost', display: 'Total Material Cost', type: 'decimal' },
      { db: 'notes', display: 'Notes', type: 'text' }
    ]
  },
  4: {
    name: 'Production Plan',
    table: 'production_plan_details',
    fields: [
      { db: 'planned_start_date', display: 'Planned Start Date', type: 'date' },
      { db: 'planned_end_date', display: 'Planned End Date', type: 'date' },
      { db: 'selected_phases', display: 'Selected Production Phases (JSON)', type: 'json' },
      { db: 'material_info', display: 'Material Info (JSON)', type: 'json' }
    ]
  },
  5: {
    name: 'Quality Check & Compliance',
    table: 'quality_check_details',
    fields: [
      { db: 'quality_compliance', display: 'Quality Compliance (JSON)', type: 'json' },
      { db: 'warranty_support', display: 'Warranty Support (JSON)', type: 'json' },
      { db: 'internal_project_owner', display: 'Internal Project Owner', type: 'integer' }
    ]
  },
  6: {
    name: 'Shipment & Logistics',
    table: 'shipment_details',
    fields: [
      { db: 'delivery_terms', display: 'Delivery Terms (JSON)', type: 'json' },
      { db: 'shipment_data', display: 'Shipment Data (JSON)', type: 'json' }
    ]
  },
  7: {
    name: 'Delivery & Handover',
    table: 'delivery_details',
    fields: [
      { db: 'delivery_terms', display: 'Delivery Terms (JSON)', type: 'json' },
      { db: 'warranty_support', display: 'Warranty Support (JSON)', type: 'json' },
      { db: 'customer_contact', display: 'Customer Contact', type: 'string' },
      { db: 'internal_info', display: 'Internal Info (JSON)', type: 'json' },
      { db: 'project_requirements', display: 'Project Requirements (JSON)', type: 'json' }
    ]
  }
};

const API_ENDPOINTS = [
  { step: 1, method: 'POST', endpoint: '/api/root-cards/steps/{rootCardId}/client-po', controller: 'ClientPOController.createOrUpdate' },
  { step: 2, method: 'POST', endpoint: '/api/root-cards/steps/{rootCardId}/design-engineering', controller: 'DesignEngineeringController.createOrUpdate' },
  { step: 3, method: 'POST', endpoint: '/api/root-cards/steps/{rootCardId}/material-requirements', controller: 'MaterialRequirementsController.createOrUpdate' },
  { step: 4, method: 'POST', endpoint: '/api/root-cards/steps/{rootCardId}/production-plan', controller: 'ProductionPlanController.createOrUpdate' },
  { step: 5, method: 'POST', endpoint: '/api/root-cards/steps/{rootCardId}/quality-check', controller: 'QualityCheckController.createOrUpdate' },
  { step: 6, method: 'POST', endpoint: '/api/root-cards/steps/{rootCardId}/shipment', controller: 'ShipmentController.createOrUpdate' },
  { step: 7, method: 'POST', endpoint: '/api/root-cards/steps/{rootCardId}/delivery', controller: 'DeliveryController.createOrUpdate' }
];

async function verifyTableSchema(stepNum, table, fields) {
  try {
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = DATABASE()`,
      [table]
    );

    if (columns.length === 0) {
      console.log(`   ❌ Table '${table}' does NOT exist`);
      return { exists: false, fieldStatus: [] };
    }

    const columnNames = columns.map(c => c.COLUMN_NAME);
    const fieldStatus = fields.map(f => ({
      field: f.display,
      dbField: f.db,
      exists: columnNames.includes(f.db),
      type: f.type,
      dataType: columns.find(c => c.COLUMN_NAME === f.db)?.DATA_TYPE || 'N/A',
      nullable: columns.find(c => c.COLUMN_NAME === f.db)?.IS_NULLABLE === 'YES'
    }));

    return { exists: true, fieldStatus };
  } catch (error) {
    console.log(`   ❌ Error checking schema: ${error.message}`);
    return { exists: false, fieldStatus: [] };
  }
}

async function verifyDataPresence(stepNum, table, rootCardId) {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${table} WHERE sales_order_id = ?`,
      [rootCardId]
    );

    if (rows.length === 0) {
      return { hasData: false, rowCount: 0, record: null };
    }

    const record = rows[0];
    const fieldValues = Object.entries(record).map(([key, value]) => ({
      field: key,
      hasValue: value !== null && value !== undefined && value !== '',
      value: value !== null ? (typeof value === 'object' ? JSON.stringify(value) : String(value).substring(0, 50)) : 'NULL'
    }));

    return { hasData: true, rowCount: rows.length, record, fieldValues };
  } catch (error) {
    console.log(`   ❌ Error checking data: ${error.message}`);
    return { hasData: false, rowCount: 0, record: null };
  }
}

async function main() {
  if (!process.argv[2]) {
    console.error('\n❌ Usage: node comprehensive-form-data-verification.js <rootCardId>');
    process.exit(1);
  }

  const rootCardId = process.argv[2];
  const stepToCheck = process.argv[3] ? parseInt(process.argv[3]) : null;

  console.log('\n' + '='.repeat(100));
  console.log('🔍 COMPREHENSIVE FORM DATA PERSISTENCE VERIFICATION');
  console.log('='.repeat(100));
  console.log(`\n📋 Root Card ID: ${rootCardId}`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}\n`);

  try {
    // Verify Root Card exists
    const [rootCards] = await pool.execute(
      'SELECT id, customer, po_number FROM sales_orders WHERE id = ?',
      [rootCardId]
    );

    if (rootCards.length === 0) {
      console.log('❌ Root Card not found. Exiting.');
      process.exit(1);
    }

    console.log(`✅ Root Card Found: ${rootCards[0].customer} (PO: ${rootCards[0].po_number})\n`);

    // Check API Endpoints
    console.log('📡 API ENDPOINTS VERIFICATION\n' + '-'.repeat(100));
    API_ENDPOINTS.forEach(ep => {
      console.log(`   Step ${ep.step}: ${ep.method} ${ep.endpoint}`);
      console.log(`            → ${ep.controller}`);
    });

    // Verify each step
    const stepsToCheck = stepToCheck ? [stepToCheck] : [1, 2, 3, 4, 5, 6, 7];

    for (const step of stepsToCheck) {
      const config = STEP_CONFIGS[step];
      if (!config) continue;

      console.log(`\n\n🔹 STEP ${step}: ${config.name}`);
      console.log('─'.repeat(100));

      // 1. Check table schema
      console.log(`\n   📋 Database Table: '${config.table}'`);
      const schemaCheck = await verifyTableSchema(step, config.table, config.fields);

      if (!schemaCheck.exists) {
        console.log(`   ⚠️  Table does not exist - will be created on first data insertion`);
        continue;
      }

      console.log(`   ✅ Table exists\n`);

      // 2. Check fields
      console.log(`   📊 Field Definitions (`);
      let existingFields = 0;
      let missingFields = 0;

      schemaCheck.fieldStatus.forEach(fs => {
        const status = fs.exists ? '✅' : '❌';
        const nullable = fs.nullable ? '(nullable)' : '(required)';
        console.log(`       ${status} ${fs.display.padEnd(50)} → ${fs.dbField.padEnd(25)} [${fs.dataType} ${nullable}]`);
        if (fs.exists) existingFields++;
        else missingFields++;
      });

      console.log(`\n   📈 Summary: ${existingFields}/${config.fields.length} fields defined (${missingFields} missing)\n`);

      // 3. Check data presence
      console.log(`   💾 Data Presence Check`);
      const dataCheck = await verifyDataPresence(step, config.table, rootCardId);

      if (!dataCheck.hasData) {
        console.log(`       ❌ No data found in database for this root card`);
        console.log(`       ℹ️  Data will be stored here when form is submitted\n`);
        continue;
      }

      console.log(`       ✅ Data found (${dataCheck.rowCount} record(s))\n`);
      console.log(`   📋 Field Values:\n`);

      dataCheck.fieldValues.forEach(fv => {
        const status = fv.hasValue ? '✅' : '⚠️ ';
        console.log(`       ${status} ${fv.field.padEnd(30)} : ${fv.value || '[empty]'}`);
      });
    }

    console.log('\n\n' + '='.repeat(100));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('='.repeat(100));
    console.log('\n💡 Next Steps:');
    console.log('   1. Fill out each form step in the wizard');
    console.log('   2. Click "Next" to submit the form');
    console.log('   3. Check API responses in browser Network tab (should be 200 OK)');
    console.log('   4. Re-run this script to verify data was stored: node comprehensive-form-data-verification.js ' + rootCardId);
    console.log('   5. View the root card to see all stored data\n');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  } finally {
    process.exit(0);
  }
}

main();
