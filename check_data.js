const pool = require('./backend/config/database');
async function check() {
  try {
    const poNumber = 'PO-MR-20260301-481';
    console.log(`Searching for PO: ${poNumber}`);
    
    const [poRows] = await pool.query('SELECT * FROM purchase_orders WHERE po_number = ?', [poNumber]);
    if (poRows.length === 0) {
      console.log('PO not found');
      process.exit(0);
    }
    const po = poRows[0];
    console.log(`PO ID: ${po.id}, Status: ${po.status}`);
    const poItems = typeof po.items === 'string' ? JSON.parse(po.items) : po.items;
    poItems.forEach(i => console.log(`  - ${i.material_name}: Qty ${i.quantity}, Rate: ${i.rate}`));

    const [grnRows] = await pool.query('SELECT * FROM grn WHERE po_id = ?', [po.id]);
    console.log('\nRelated GRNs:');
    for (const grn of grnRows) {
      console.log(`GRN ID: ${grn.id}, QC Status: ${grn.qc_status}, Received Qty: ${grn.received_quantity}`);
      const items = typeof grn.items === 'string' ? JSON.parse(grn.items) : grn.items;
      items.forEach(i => console.log(`  - ${i.material_name || i.description}: Qty ${i.quantity}, Received: ${i.received_quantity}, Invoiced: ${i.invoice_quantity}`));
      
      const [qcRows] = await pool.query('SELECT * FROM qc_inspections WHERE grn_id = ?', [grn.id]);
      console.log(`  QC Inspections for GRN ${grn.id}:`);
      for (const qc of qcRows) {
        console.log(`    QC ID: ${qc.id}, Status: ${qc.status}`);
        const results = typeof qc.items_results === 'string' ? JSON.parse(qc.items_results) : qc.items_results;
        if (results && Array.isArray(results)) {
          results.forEach(r => console.log(`      - ${r.description || r.item_name}: Ordered: ${r.ordered_quantity}, Invoice: ${r.invoice_quantity}, Accepted: ${r.accepted}, Received: ${r.received_quantity}`));
        }
      }
    }

    if (po.material_request_id) {
        const [mrRows] = await pool.query('SELECT * FROM material_requests WHERE id = ?', [po.material_request_id]);
        if (mrRows.length > 0) {
            const mr = mrRows[0];
            console.log(`\nRelated MR: ID: ${mr.id}, MR Number: ${mr.mr_number}`);
            
            const [mrItems] = await pool.query('SELECT * FROM material_request_items WHERE material_request_id = ?', [mr.id]);
            mrItems.forEach(i => console.log(`  - ${i.material_name}: Qty ${i.quantity}`));
        }
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
