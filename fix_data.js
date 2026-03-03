const pool = require('./backend/config/database');
async function fix() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const grnId = 1;
    const poNumber = 'PO-MR-20260301-481';
    
    console.log(`Fixing data for GRN ${grnId} and PO ${poNumber}`);
    
    // 1. Get correct quantities from PO
    const [poRows] = await connection.query('SELECT items FROM purchase_orders WHERE po_number = ?', [poNumber]);
    if (poRows.length === 0) throw new Error('PO not found');
    const poItems = typeof poRows[0].items === 'string' ? JSON.parse(poRows[0].items) : poRows[0].items;
    
    // Create a map for easy lookup
    const correctQtys = {};
    poItems.forEach(item => {
        correctQtys[item.material_name] = Number(item.quantity);
    });
    
    console.log('Correct Quantities:', correctQtys);

    // 2. Update QC Inspection
    const [qcRows] = await connection.query('SELECT id, items_results FROM qc_inspections WHERE grn_id = ?', [grnId]);
    if (qcRows.length > 0) {
        const qc = qcRows[0];
        let results = typeof qc.items_results === 'string' ? JSON.parse(qc.items_results) : qc.items_results;
        
        results = results.map(r => {
            const desc = r.description || r.item_name;
            const correctQty = correctQtys[desc];
            if (correctQty !== undefined) {
                return {
                    ...r,
                    invoice_quantity: correctQty,
                    accepted: correctQty,
                    shortage: 0,
                    overage: 0
                };
            }
            return r;
        });
        
        await connection.query('UPDATE qc_inspections SET items_results = ? WHERE id = ?', [JSON.stringify(results), qc.id]);
        console.log('Updated QC Inspection items_results');
    }

    // 3. Update GRN items and received_quantity
    const [grnRows] = await connection.query('SELECT items FROM grn WHERE id = ?', [grnId]);
    if (grnRows.length > 0) {
        let grnItems = typeof grnRows[0].items === 'string' ? JSON.parse(grnRows[0].items) : grnRows[0].items;
        let totalReceived = 0;
        
        grnItems = grnItems.map(item => {
            const desc = item.material_name || item.description;
            const correctQty = correctQtys[desc];
            if (correctQty !== undefined) {
                totalReceived += correctQty;
                return {
                    ...item,
                    received_quantity: correctQty,
                    invoice_quantity: correctQty,
                    shortage_quantity: 0,
                    overage_quantity: 0
                };
            }
            totalReceived += (Number(item.received_quantity) || 0);
            return item;
        });
        
        await connection.query('UPDATE grn SET items = ?, received_quantity = ? WHERE id = ?', [JSON.stringify(grnItems), totalReceived, grnId]);
        console.log(`Updated GRN items and received_quantity (${totalReceived})`);
    }

    await connection.commit();
    console.log('SUCCESS: Data fixed.');
    process.exit(0);
  } catch (e) {
    await connection.rollback();
    console.error('FAILURE:', e);
    process.exit(1);
  } finally {
    connection.release();
  }
}
fix();
