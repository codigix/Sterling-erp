const pool = require('./config/database');

async function checkDesignDocs() {
  try {
    const rootCardId = 31; // LR-ASHM Load Simulation Dummy

    const [results] = await pool.execute(
      `SELECT id, sales_order_id, documents, drawings_3d, design_status FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
    );

    console.log('\n========== Design Engineering Details ==========');
    console.log(`Root Card ID: ${rootCardId}`);
    console.log(`Records found: ${results.length}`);

    if (results.length > 0) {
      const record = results[0];
      console.log('\nRecord ID:', record.id);
      console.log('Status:', record.design_status);
      
      console.log('\n--- Documents (required-docs) ---');
      try {
        const docs = JSON.parse(record.documents || '[]');
        console.log('Count:', docs.length);
        console.log('Data:', JSON.stringify(docs, null, 2));
      } catch (e) {
        console.log('Raw:', record.documents);
      }

      console.log('\n--- Drawings (raw-designs) ---');
      try {
        const drawings = JSON.parse(record.drawings_3d || '[]');
        console.log('Count:', drawings.length);
        console.log('Data:', JSON.stringify(drawings, null, 2));
      } catch (e) {
        console.log('Raw:', record.drawings_3d);
      }
    } else {
      console.log('No design engineering details found for this root card');
    }

    // Also check if documents were uploaded to Drawing and Specification tables
    console.log('\n========== Drawing Records ==========');
    const [drawings] = await pool.execute(
      `SELECT id, name, root_card_id FROM drawings WHERE root_card_id = ?`,
      [rootCardId]
    );
    console.log(`Found ${drawings.length} drawing records`);
    drawings.forEach(d => console.log(`  - ${d.id}: ${d.name}`));

    console.log('\n========== Specification Records ==========');
    const [specs] = await pool.execute(
      `SELECT id, title, sales_order_id FROM specifications WHERE sales_order_id = ?`,
      [rootCardId]
    );
    console.log(`Found ${specs.length} specification records`);
    specs.forEach(s => console.log(`  - ${s.id}: ${s.title}`));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDesignDocs();
