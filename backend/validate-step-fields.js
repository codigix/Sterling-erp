const pool = require('./config/database');
require('dotenv').config();

const STEP_VALIDATORS = {
  1: {
    name: 'Client PO Details',
    table: 'client_po_details',
    requiredFields: ['po_number', 'po_date', 'client_name', 'client_email', 'client_phone', 'project_name', 'project_code'],
    optionalFields: ['client_address', 'billing_address', 'shipping_address', 'po_value', 'currency', 'notes', 'project_requirements', 'product_details'],
    jsonFields: ['project_requirements', 'terms_conditions', 'attachments', 'product_details'],
    description: 'PO information, client details, project details, requirements, and product details'
  },
  2: {
    name: 'Design Engineering Details',
    table: 'design_engineering_details',
    requiredFields: [],
    optionalFields: ['design_details', 'documents', 'specifications'],
    jsonFields: ['design_details', 'documents', 'specifications'],
    description: 'General design info, product specification, materials, attachments, comments'
  },
  3: {
    name: 'Material Requirements Details',
    table: 'material_requirements_details',
    requiredFields: [],
    optionalFields: ['materials', 'procurement_status', 'total_material_cost', 'notes', 'assigned_to'],
    jsonFields: ['materials'],
    description: 'Materials list with quantities, vendors, and costs'
  },
  4: {
    name: 'Production Plan Details',
    table: 'production_plan_details',
    requiredFields: [],
    optionalFields: ['planned_start_date', 'planned_end_date', 'selected_phases', 'material_info', 'assigned_to'],
    jsonFields: ['selected_phases', 'material_info'],
    description: 'Production timeline, phases, material preparation info'
  },
  5: {
    name: 'Quality Check Details',
    table: 'quality_check_details',
    requiredFields: [],
    optionalFields: ['quality_compliance', 'warranty_support', 'internal_project_owner', 'assigned_to'],
    jsonFields: ['quality_compliance', 'warranty_support'],
    description: 'Quality standards, compliance, warranty, and internal owner'
  },
  6: {
    name: 'Shipment Details',
    table: 'shipment_details',
    requiredFields: [],
    optionalFields: ['delivery_terms', 'shipment_data', 'assigned_to'],
    jsonFields: ['delivery_terms', 'shipment_data'],
    description: 'Delivery schedule, packing, dispatch, and shipment info'
  },
  7: {
    name: 'Delivery Details',
    table: 'delivery_details',
    requiredFields: [],
    optionalFields: ['delivery_terms', 'warranty_support', 'customer_contact', 'internal_info', 'project_requirements', 'assigned_to'],
    jsonFields: ['delivery_terms', 'warranty_support', 'internal_info', 'project_requirements'],
    description: 'Delivery terms, warranty, customer contact, internal info'
  }
};

async function validateStepFields(salesOrderId, stepNumber = null) {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(15) + '🔍 FIELD-BY-FIELD DATABASE VALIDATION' + ' '.repeat(26) + '║');
  console.log('╚' + '═'.repeat(78) + '╝\n');

  if (!salesOrderId) {
    console.error('❌ Usage: node validate-step-fields.js <salesOrderId> [stepNumber]');
    console.error('   Example: node validate-step-fields.js 5');
    console.error('   Example: node validate-step-fields.js 5 1  (check only step 1)');
    process.exit(1);
  }

  try {
    // Verify Sales Order exists
    const [salesOrders] = await pool.execute(
      'SELECT id, customer, po_number FROM sales_orders WHERE id = ?',
      [salesOrderId]
    );

    if (salesOrders.length === 0) {
      console.error(`❌ Sales Order #${salesOrderId} not found!\n`);
      process.exit(1);
    }

    console.log(`✅ Sales Order Found: ${salesOrders[0].customer} (PO: ${salesOrders[0].po_number})\n`);

    // Validate requested steps
    const stepsToCheck = stepNumber ? [parseInt(stepNumber)] : [1, 2, 3, 4, 5, 6, 7];

    let totalFieldsFound = 0;
    let totalFieldsMissing = 0;

    for (const step of stepsToCheck) {
      const validator = STEP_VALIDATORS[step];
      if (!validator) {
        console.log(`⚠️  Step ${step}: No validator defined\n`);
        continue;
      }

      console.log(`\n${'═'.repeat(80)}`);
      console.log(`STEP ${step}: ${validator.name}`);
      console.log(`${'═'.repeat(80)}`);
      console.log(`📋 Description: ${validator.description}\n`);

      try {
        const [rows] = await pool.execute(
          `SELECT * FROM ${validator.table} WHERE sales_order_id = ?`,
          [salesOrderId]
        );

        if (rows.length === 0) {
          console.log(`❌ No data found in ${validator.table}\n`);
          totalFieldsMissing += validator.requiredFields.length + validator.optionalFields.length;
          continue;
        }

        const rowData = rows[0];
        console.log(`✅ Table '${validator.table}' has data\n`);

        // Check required fields
        console.log('📌 REQUIRED FIELDS:');
        let stepFieldsFound = 0;
        let stepFieldsMissing = 0;

        for (const field of validator.requiredFields) {
          const value = rowData[field];
          const hasValue = value !== null && value !== undefined && value !== '';

          if (hasValue) {
            const displayValue = validator.jsonFields.includes(field)
              ? `${String(value).substring(0, 40)}...`
              : `${value}`;
            console.log(`   ✅ ${field.padEnd(30)} = ${displayValue}`);
            stepFieldsFound++;
          } else {
            console.log(`   ❌ ${field.padEnd(30)} = (missing/empty)`);
            stepFieldsMissing++;
          }
        }

        // Check optional fields
        if (validator.optionalFields.length > 0) {
          console.log('\n📋 OPTIONAL FIELDS:');
          for (const field of validator.optionalFields) {
            const value = rowData[field];
            const hasValue = value !== null && value !== undefined && value !== '';

            if (hasValue) {
              const displayValue = validator.jsonFields.includes(field)
                ? `${String(value).substring(0, 40)}...`
                : `${value}`;
              console.log(`   ✅ ${field.padEnd(30)} = ${displayValue}`);
              stepFieldsFound++;
            } else {
              console.log(`   ⚪ ${field.padEnd(30)} = (not filled)`);
            }
          }
        }

        // Validate JSON fields
        if (validator.jsonFields.length > 0) {
          console.log('\n🔍 JSON FIELD VALIDATION:');
          for (const jsonField of validator.jsonFields) {
            const value = rowData[jsonField];
            if (value) {
              try {
                if (typeof value === 'string') {
                  const parsed = JSON.parse(value);
                  console.log(`   ✅ ${jsonField.padEnd(30)} = Valid JSON`);
                } else {
                  console.log(`   ✅ ${jsonField.padEnd(30)} = Valid JSON (object)`);
                }
              } catch (e) {
                console.log(`   ❌ ${jsonField.padEnd(30)} = Invalid JSON`);
              }
            }
          }
        }

        console.log(`\n📊 Step ${step} Summary: ${stepFieldsFound} fields found, ${stepFieldsMissing} missing`);
        totalFieldsFound += stepFieldsFound;
        totalFieldsMissing += stepFieldsMissing;

      } catch (error) {
        console.log(`❌ Error validating step ${step}: ${error.message}\n`);
      }
    }

    // Overall summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 OVERALL SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\n✅ Fields Found: ${totalFieldsFound}`);
    console.log(`❌ Fields Missing/Empty: ${totalFieldsMissing}`);
    console.log(`📊 Completion Rate: ${totalFieldsFound > 0 ? Math.round((totalFieldsFound / (totalFieldsFound + totalFieldsMissing)) * 100) : 0}%\n`);

    if (totalFieldsMissing === 0) {
      console.log('🎉 All data has been correctly saved to the database!\n');
    } else {
      console.log('⚠️  Some fields are missing. Make sure to:');
      console.log('   1. Fill out all required fields in the form');
      console.log('   2. Click Next/Save button to save each step');
      console.log('   3. Check browser console for validation errors\n');
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

const salesOrderId = process.argv[2];
const stepNumber = process.argv[3];
validateStepFields(salesOrderId, stepNumber);
