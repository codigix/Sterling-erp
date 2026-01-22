const pool = require('./config/database');

async function insertTestData() {
  try {
    const rootCardId = 6;
    
    console.log('🔧 Inserting test data for Steps 6 and 8...\n');

    // Insert Step 6 - Quality Check
    console.log('📝 Inserting Step 6 - Quality Check');
    await pool.execute(`
      INSERT INTO quality_check_details 
      (sales_order_id, quality_standards, welding_standards, surface_finish, mechanical_load_testing,
       electrical_compliance, documents_required, warranty_period, service_support, 
       qc_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      quality_standards = VALUES(quality_standards),
      welding_standards = VALUES(welding_standards),
      surface_finish = VALUES(surface_finish),
      mechanical_load_testing = VALUES(mechanical_load_testing),
      electrical_compliance = VALUES(electrical_compliance),
      documents_required = VALUES(documents_required),
      warranty_period = VALUES(warranty_period),
      service_support = VALUES(service_support),
      updated_at = CURRENT_TIMESTAMP
    `, [
      rootCardId,
      'ISO 9001:2015, DRDO standards',
      'AWS D1.1, EN 287',
      'Ra 1.6, Polished',
      '1.5x load capacity',
      'IEC 61439, IP65',
      'QAP, FAT Report, CoC',
      '12 months',
      '24/7 support',
      'pending'
    ]);
    console.log('✅ Step 6 data inserted\n');

    // Insert Step 8 - Delivery
    console.log('📝 Inserting Step 8 - Delivery');
    await pool.execute(`
      INSERT INTO delivery_details 
      (sales_order_id, customer_contact, installation_completed, site_commissioning_completed,
       warranty_terms_acceptance, project_manager, production_supervisor, delivery_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      customer_contact = VALUES(customer_contact),
      installation_completed = VALUES(installation_completed),
      site_commissioning_completed = VALUES(site_commissioning_completed),
      warranty_terms_acceptance = VALUES(warranty_terms_acceptance),
      project_manager = VALUES(project_manager),
      production_supervisor = VALUES(production_supervisor),
      updated_at = CURRENT_TIMESTAMP
    `, [
      rootCardId,
      'Sanika Mote - sanikamote@gmail.com',
      'Yes, factory assembly required',
      'After delivery on site',
      'Warranty: 12 months, Service: 24/7 support',
      'Project Manager',
      'Production Supervisor',
      'pending'
    ]);
    console.log('✅ Step 8 data inserted\n');

    // Verify
    console.log('🔍 Verifying insertion...');
    const [qc] = await pool.execute('SELECT * FROM quality_check_details WHERE sales_order_id = ?', [rootCardId]);
    const [delivery] = await pool.execute('SELECT * FROM delivery_details WHERE sales_order_id = ?', [rootCardId]);
    
    console.log(`✅ Step 6: ${qc.length > 0 ? 'FOUND in database' : 'NOT FOUND'}`);
    console.log(`✅ Step 8: ${delivery.length > 0 ? 'FOUND in database' : 'NOT FOUND'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertTestData();
