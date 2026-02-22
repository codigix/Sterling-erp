const pool = require('./config/database');

async function checkData() {
  try {
    const rootCardId = 31;
    
    console.log('\n========== Checking Design Engineering Data ==========');
    
    const [rows] = await pool.execute(
      `SELECT id, sales_order_id, documents, drawings_3d FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
    );

    if (rows.length === 0) {
      console.log('No design engineering record found');
      process.exit(0);
    }

    const record = rows[0];
    console.log(`\n✓ Design Engineering Record Found for Root Card ${rootCardId}`);
    console.log(`  ID: ${record.id}`);
    
    console.log('\n--- DOCUMENTS (stored in documents column) ---');
    console.log('Raw value:', record.documents);
    try {
      const docs = JSON.parse(record.documents || '[]');
      console.log('Parsed count:', docs.length);
      console.log('Parsed data:', JSON.stringify(docs, null, 2));
    } catch (e) {
      console.log('Error parsing:', e.message);
    }

    console.log('\n--- DRAWINGS (stored in drawings_3d column) ---');
    console.log('Raw value:', record.drawings_3d);
    try {
      const drawings = JSON.parse(record.drawings_3d || '[]');
      console.log('Parsed count:', drawings.length);
      console.log('Parsed data:', JSON.stringify(drawings, null, 2));
    } catch (e) {
      console.log('Error parsing:', e.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
