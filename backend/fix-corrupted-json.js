const pool = require('./config/database');

async function fixCorruptedJSON() {
  try {
    console.log('🔧 Starting data corruption fix...\n');

    // Fix Step 1: Client PO Details
    console.log('📝 Fixing Step 1 - Client PO Details');
    await pool.execute(`
      UPDATE client_po_details 
      SET project_requirements = NULL
      WHERE project_requirements = '[object Object]'
    `);
    const step1Result = await pool.execute(
      `SELECT ROW_COUNT() as count`
    );
    console.log(`✅ Fixed ${step1Result[0][0]?.count || 0} corrupted project_requirements\n`);

    // Fix Step 2: Sales Order Details
    console.log('📝 Fixing Step 2 - Sales Order Details');
    
    // Fix product_details
    await pool.execute(`
      UPDATE sales_order_details 
      SET product_details = NULL
      WHERE product_details = '[object Object]'
    `);
    
    // Fix quality_compliance
    await pool.execute(`
      UPDATE sales_order_details 
      SET quality_compliance = NULL
      WHERE quality_compliance = '[object Object]'
    `);
    
    // Fix warranty_support
    await pool.execute(`
      UPDATE sales_order_details 
      SET warranty_support = NULL
      WHERE warranty_support = '[object Object]'
    `);
    
    // Fix internal_info
    await pool.execute(`
      UPDATE sales_order_details 
      SET internal_info = NULL
      WHERE internal_info = '[object Object]'
    `);
    
    const step2Rows = await pool.execute(
      `SELECT COUNT(*) as count FROM sales_order_details WHERE 
        product_details = '[object Object]' OR 
        quality_compliance = '[object Object]' OR 
        warranty_support = '[object Object]' OR 
        internal_info = '[object Object]'`
    );
    console.log(`✅ Fixed ${step2Rows[0][0]?.count || 0} corrupted sales order fields\n`);

    // Fix Step 3: Design Engineering (if needed)
    console.log('📝 Checking Step 3 - Design Engineering');
    console.log('✅ Skipping (design_engineering uses different schema)\n');

    // Fix Step 4: Material Requirements Details
    console.log('📝 Fixing Step 4 - Material Requirements Details');
    await pool.execute(`
      UPDATE material_requirements_details 
      SET materials = NULL
      WHERE materials = '[object Object]'
    `);
    const step4Result = await pool.execute(
      `SELECT ROW_COUNT() as count`
    );
    console.log(`✅ Fixed ${step4Result[0][0]?.count || 0} corrupted materials arrays\n`);

    // Verify all fixes
    console.log('🔍 Verifying fixes...\n');
    const verification = await pool.execute(`
      SELECT 
        'client_po_details.project_requirements' as field, 
        COUNT(*) as corrupted_count
      FROM client_po_details 
      WHERE project_requirements = '[object Object]'
      
      UNION ALL
      
      SELECT 'sales_order_details.product_details', COUNT(*)
      FROM sales_order_details 
      WHERE product_details = '[object Object]'
      
      UNION ALL
      
      SELECT 'sales_order_details.quality_compliance', COUNT(*)
      FROM sales_order_details 
      WHERE quality_compliance = '[object Object]'
      
      UNION ALL
      
      SELECT 'material_requirements_details.materials', COUNT(*)
      FROM material_requirements_details 
      WHERE materials = '[object Object]'
    `);

    if (verification[0].length > 0) {
      console.log('⚠️  Remaining corrupted entries:');
      verification[0].forEach(row => {
        console.log(`   - ${row.field}: ${row.corrupted_count}`);
      });
    } else {
      console.log('✅ All corrupted JSON fixed!');
    }

    console.log('\n✅ Data corruption fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing corrupted data:', error);
    process.exit(1);
  }
}

fixCorruptedJSON();
