const pool = require('./config/database');

async function checkDatabase() {
  try {
    const rootCardId = 31;
    
    console.log('\n========== CHECKING DESIGN ENGINEERING TABLE ==========\n');
    
    // Check design_engineering_details
    const [designRows] = await pool.execute(
      `SELECT id, sales_order_id, documents, drawings_3d, design_status FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
    );

    console.log(`Found ${designRows.length} design engineering records for Root Card ${rootCardId}`);
    
    if (designRows.length > 0) {
      const record = designRows[0];
      console.log('\nDesign Engineering Record:');
      console.log('  ID:', record.id);
      console.log('  Sales Order ID:', record.sales_order_id);
      console.log('  Design Status:', record.design_status);
      
      console.log('\n--- DOCUMENTS Column (Raw) ---');
      console.log(record.documents);
      
      console.log('\n--- DRAWINGS_3D Column (Raw) ---');
      console.log(record.drawings_3d);

      try {
        const docs = JSON.parse(record.documents || '[]');
        const draws = JSON.parse(record.drawings_3d || '[]');
        console.log(`\n✓ Documents parsed: ${docs.length} items`);
        console.log(`✓ Drawings parsed: ${draws.length} items`);
      } catch (e) {
        console.log('\n✗ Error parsing JSON:', e.message);
      }
    } else {
      console.log('⚠ No design engineering record found!\n');
    }

    // Also check Drawing and Specification tables
    console.log('\n========== CHECKING DRAWING TABLE ==========\n');
    const [drawingRows] = await pool.execute(
      `SELECT id, name, root_card_id FROM drawings WHERE root_card_id = ?`,
      [rootCardId]
    );
    console.log(`Found ${drawingRows.length} drawings`);
    drawingRows.forEach(d => console.log(`  - ${d.id}: ${d.name}`));

    console.log('\n========== CHECKING SPECIFICATION TABLE ==========\n');
    const [specRows] = await pool.execute(
      `SELECT id, title, sales_order_id FROM specifications WHERE sales_order_id = ?`,
      [rootCardId]
    );
    console.log(`Found ${specRows.length} specifications`);
    specRows.forEach(s => console.log(`  - ${s.id}: ${s.title}`));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
