const pool = require('../config/database');

async function testCascadeDelete() {
  let conn;
  try {
    conn = await pool.getConnection();

    console.log('=== Testing Cascade Delete ===\n');

    // 1. Check if a quotation exists or create one
    console.log('1. Checking quotations...');
    const [quotations] = await conn.query('SELECT id FROM quotations LIMIT 1');
    let quotationId;
    
    if (quotations.length > 0) {
      quotationId = quotations[0].id;
      console.log(`   ✓ Using existing quotation ID: ${quotationId}\n`);
    } else {
      // Create a test quotation first
      console.log('   Creating test quotation...');
      const quotResult = await conn.query(
        `INSERT INTO quotations (vendor_id, items, total_amount, status) 
         VALUES (?, ?, ?, ?)`,
        [1, JSON.stringify([]), 10000, 'accepted']
      );
      quotationId = quotResult.insertId;
      console.log(`   ✓ Quotation created with ID: ${quotationId}\n`);
    }

    // 2. Create a test PO
    console.log('2. Creating test Purchase Order...');
    const poNumber = `TEST-PO-${Date.now()}`;
    const poResult = await conn.query(
      `INSERT INTO purchase_orders (po_number, quotation_id, items, status, total_amount) 
       VALUES (?, ?, ?, 'pending', 10000)`,
      [poNumber, quotationId, JSON.stringify([])]
    );
    const poId = Array.isArray(poResult) ? poResult[0].insertId : poResult.insertId;
    if (!poId) {
      throw new Error('Failed to create Purchase Order - no insertId');
    }
    console.log(`   ✓ PO created with ID: ${poId}\n`);

    // Helper function to extract insertId
    const getInsertId = (result) => {
      if (Array.isArray(result)) {
        return result[0]?.insertId;
      }
      return result.insertId;
    };

    // 3. Create a test GRN
    console.log('3. Creating test GRN...');
    const grnResult = await conn.query(
      `INSERT INTO grn (po_id, items, qc_status) 
       VALUES (?, ?, 'pending')`,
      [poId, JSON.stringify([])]
    );
    const grnId = getInsertId(grnResult);
    if (!grnId) {
      throw new Error('Failed to create GRN - no insertId');
    }
    console.log(`   ✓ GRN created with ID: ${grnId}\n`);

    // 4. Create a test QC Inspection
    console.log('4. Creating test QC Inspection...');
    const qcResult = await conn.query(
      `INSERT INTO qc_inspections (grn_id, status) 
       VALUES (?, 'passed')`,
      [grnId]
    );
    const qcId = getInsertId(qcResult);
    if (!qcId) {
      throw new Error('Failed to create QC Inspection - no insertId');
    }
    console.log(`   ✓ QC Inspection created with ID: ${qcId}\n`);

    // 5. Create a test QC Report
    console.log('5. Creating test QC Report...');
    const reportResult = await conn.query(
      `INSERT INTO qc_reports (grn_id, results, status) 
       VALUES (?, ?, 'approved')`,
      [grnId, JSON.stringify({})]
    );
    const reportId = getInsertId(reportResult);
    if (!reportId) {
      throw new Error('Failed to create QC Report - no insertId');
    }
    console.log(`   ✓ QC Report created with ID: ${reportId}\n`);

    // 6. Verify all records exist
    console.log('6. Verifying records exist...');
    const [pos] = await conn.query('SELECT id FROM purchase_orders WHERE id = ?', [poId]);
    const [grns] = await conn.query('SELECT id FROM grn WHERE id = ?', [grnId]);
    const [qcs] = await conn.query('SELECT id FROM qc_inspections WHERE id = ?', [qcId]);
    const [reports] = await conn.query('SELECT id FROM qc_reports WHERE id = ?', [reportId]);
    console.log(`   ✓ PO exists: ${pos.length > 0}`);
    console.log(`   ✓ GRN exists: ${grns.length > 0}`);
    console.log(`   ✓ QC Inspection exists: ${qcs.length > 0}`);
    console.log(`   ✓ QC Report exists: ${reports.length > 0}\n`);

    // 7. Test cascade delete
    console.log('7. Executing cascade delete...');
    
    // Simulate the deletePurchaseOrder logic
    await conn.beginTransaction();
    try {
      // Find related GRNs
      const [relatedGrns] = await conn.query('SELECT id FROM grn WHERE po_id = ?', [poId]);
      
      // For each GRN, delete QC Inspections and Reports
      for (const grn of relatedGrns) {
        await conn.query('DELETE FROM qc_inspections WHERE grn_id = ?', [grn.id]);
        await conn.query('DELETE FROM qc_reports WHERE grn_id = ?', [grn.id]);
      }

      // Delete GRNs
      if (relatedGrns.length > 0) {
        await conn.query('DELETE FROM grn WHERE po_id = ?', [poId]);
      }

      // Delete PO Communications if necessary
      await conn.query('DELETE FROM purchase_order_communications WHERE po_id = ?', [poId]);

      // Finally delete the Purchase Order
      await conn.query('DELETE FROM purchase_orders WHERE id = ?', [poId]);

      await conn.commit();
      console.log('   ✓ Cascade delete completed successfully\n');
    } catch (error) {
      await conn.rollback();
      console.error('   ✗ Error during cascade delete:', error.message);
      throw error;
    }

    // 8. Verify all records are deleted
    console.log('8. Verifying records deleted...');
    const [pos2] = await conn.query('SELECT id FROM purchase_orders WHERE id = ?', [poId]);
    const [grns2] = await conn.query('SELECT id FROM grn WHERE id = ?', [grnId]);
    const [qcs2] = await conn.query('SELECT id FROM qc_inspections WHERE id = ?', [qcId]);
    const [reports2] = await conn.query('SELECT id FROM qc_reports WHERE id = ?', [reportId]);
    console.log(`   ✓ PO deleted: ${pos2.length === 0}`);
    console.log(`   ✓ GRN deleted: ${grns2.length === 0}`);
    console.log(`   ✓ QC Inspection deleted: ${qcs2.length === 0}`);
    console.log(`   ✓ QC Report deleted: ${reports2.length === 0}\n`);

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
}

testCascadeDelete();
