const QCInspection = require('../../models/QCInspection');
const pool = require('../../config/database');

exports.getGRNInspections = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    // Fetch all GRNs with their PO and Vendor details, and any existing QC inspection
    const [rows] = await conn.query(`
        SELECT 
            grn.id as grn_id, 
            grn.items, 
            grn.qc_status as grn_qc_status, 
            grn.created_at as received_date,
            po.po_number,
            v.name as vendor_name,
            qi.id as inspection_id,
            qi.status as inspection_status,
            qi.items_results
        FROM grn
        LEFT JOIN purchase_orders po ON grn.po_id = po.id
        LEFT JOIN quotations q ON po.quotation_id = q.id
        LEFT JOIN vendors v ON q.vendor_id = v.id
        LEFT JOIN qc_inspections qi ON qi.grn_id = grn.id
        ORDER BY grn.created_at DESC
    `);
    conn.release();

    const grnInspections = rows.map(row => {
        let acceptedItems = 0;
        let rejectedItems = 0;
        let overageItems = 0;
        let totalItemsCount = 0;
        
        let grnItems = [];
        if (typeof row.items === 'string') {
            try { grnItems = JSON.parse(row.items); } catch(e) { grnItems = []; }
        } else {
            grnItems = row.items || [];
        }
        
        totalItemsCount = grnItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

        if (row.items_results) {
             let results = [];
             if (typeof row.items_results === 'string') {
                 try { results = JSON.parse(row.items_results); } catch(e) { results = []; }
             } else {
                 results = row.items_results || [];
             }
             
             if (Array.isArray(results)) {
                 results.forEach(res => {
                     acceptedItems += (Number(res.accepted) || 0);
                     rejectedItems += (Number(res.rejected) || 0);
                     overageItems += (Number(res.overage) || 0);
                 });
             }
        }

        // Determine status
        // If inspection_status exists, use it. Otherwise use grn_qc_status.
        let status = row.inspection_status || row.grn_qc_status || 'pending';
        
        // Map DB status to UI status
        // DB can have: pending, in_progress, passed, failed, conditional, partially_completed, shortage, overage
        // We want to preserve specific statuses for the UI
        if (status === 'approved') status = 'passed'; // Normalize approved to passed for consistency
        
        // Only map old/irrelevant statuses to 'completed' or keep them if they are meaningful
        if (['conditional', 'partially_completed'].includes(status)) {
             // Maybe keep them or map to something else. For now let's leave them or map to passed?
             // actually let's just NOT map 'shortage', 'overage', 'passed', 'failed' to 'completed'.
        }

        return {
            id: `GRN-${row.grn_id}`, // Display ID
            dbId: row.grn_id,        // Real ID for actions
            inspectionId: row.inspection_id,
            poNumber: row.po_number || 'N/A',
            vendor: row.vendor_name || 'N/A',
            receivedDate: row.received_date,
            items: totalItemsCount,
            qcStatus: status,
            acceptedItems,
            rejectedItems,
            overageItems
        };
    });

    const stats = {
      totalGRN: grnInspections.length,
      pendingGRN: grnInspections.filter(g => g.qcStatus === 'pending').length,
      inProgressGRN: grnInspections.filter(g => g.qcStatus === 'in-progress').length,
      completedGRN: grnInspections.filter(g => g.qcStatus === 'completed').length
    };

    res.json({ grnInspections, stats });
  } catch (error) {
    console.error('Get GRN inspections error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStageQC = async (req, res) => {
  try {
    const stageQC = [
      {
        id: 'STQC-001',
        stage: 'In-house Assembly Stage 1',
        projectId: 'PROJ-001',
        status: 'pending',
        dueDate: '2025-02-05'
      },
      {
        id: 'STQC-002',
        stage: 'Outsourced - Painting',
        projectId: 'PROJ-002',
        status: 'pending',
        dueDate: '2025-02-08'
      },
      {
        id: 'STQC-003',
        stage: 'Testing & Assembly',
        projectId: 'PROJ-001',
        status: 'completed',
        dueDate: '2025-01-20'
      }
    ];

    const stats = {
      totalStageQC: stageQC.length,
      pendingStageQC: stageQC.filter(s => s.status === 'pending').length,
      inProgressStageQC: stageQC.filter(s => s.status === 'in-progress').length,
      completedStageQC: stageQC.filter(s => s.status === 'completed').length
    };

    res.json({ stageQC, stats });
  } catch (error) {
    console.error('Get stage QC error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create or Update Inspection
exports.saveInspection = async (req, res) => {
    try {
        const { grnId, itemsResults, status, remarks, inspectorId } = req.body;
        
        // Map qc_inspections status (passed/failed) to grn status (approved/rejected)
        let grnStatus = null;
        if (status === 'passed') grnStatus = 'approved';
        else if (status === 'failed') grnStatus = 'rejected';
        else if (status === 'conditional') grnStatus = 'hold';
        else if (status === 'partially_completed') grnStatus = 'approved'; // Or maybe 'partial'? Using 'approved' for now as inventory is good.
        else if (status === 'shortage') grnStatus = 'approved'; // Inventory good, just short
        else if (status === 'overage') grnStatus = 'approved'; // Inventory good, just over
        
        // Calculate total accepted quantity from inspection
        let totalReceivedQty = 0;
        if (Array.isArray(itemsResults)) {
            totalReceivedQty = itemsResults.reduce((sum, item) => sum + (Number(item.accepted) || 0), 0);
        }
        
        // check if inspection already exists
        const existing = await QCInspection.getByGRNId(grnId);
        let inspectionId;
        
        if (existing && existing.length > 0) {
            // Update
            inspectionId = existing[0].id;
            await QCInspection.updateStatus(inspectionId, status, remarks, itemsResults);
        } else {
            // Create
            inspectionId = await QCInspection.create({
                grnId,
                itemsResults,
                status, // 'pending' by default in create, but we can update it immediately or add status param to create
                remarks,
                inspectorId,
                inspectionType: 'grn'
            });
             // Force update status if provided (since create defaults to pending)
             if (status && status !== 'pending') {
                 await QCInspection.updateStatus(inspectionId, status, remarks, itemsResults);
             }
        }

        // Update GRN table with status, received_quantity, inspection_status AND items details
        const conn = await pool.getConnection();
        
        // Fetch current GRN to get items
        const [currentGrn] = await conn.query('SELECT items FROM grn WHERE id = ?', [grnId]);
        let grnItems = [];
        if (currentGrn && currentGrn.length > 0) {
             grnItems = typeof currentGrn[0].items === 'string' ? JSON.parse(currentGrn[0].items) : (currentGrn[0].items || []);
        }

        // Update items with inspection results
        const updatedGrnItems = grnItems.map(item => {
             const result = itemsResults.find(r => r.description === item.description);
             if (result) {
                 return {
                     ...item,
                     invoice_quantity: Number(result.invoice_quantity) || 0,
                     received_quantity: Number(result.accepted) || 0, // accepted is the received/approved qty for inventory
                     rejected_quantity: Number(result.rejected) || 0,
                     overage_quantity: Number(result.overage) || 0,
                     notes: result.notes || ''
                 };
             }
             return item;
        });

        let updateQuery = 'UPDATE grn SET ';
        const updateParams = [];
        
        if (grnStatus) {
            updateQuery += 'qc_status = ?, ';
            updateParams.push(grnStatus);
        }
        
        // Update total received quantity (sum of accepted)
        updateQuery += 'received_quantity = ?, ';
        updateParams.push(totalReceivedQty);

        // Update items JSON with new quantities
        updateQuery += 'items = ?, ';
        updateParams.push(JSON.stringify(updatedGrnItems));
        
        updateQuery += 'inspection_status = ? WHERE id = ?';
        updateParams.push(status, grnId);
        
        await conn.query(updateQuery, updateParams);
        conn.release();
        
        const message = existing && existing.length > 0 ? 'Inspection updated successfully' : 'Inspection created successfully';
        res.json({ message, id: inspectionId });

    } catch (error) {
        console.error('Save inspection error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getInspectionDetails = async (req, res) => {
    try {
        const { grnId } = req.params;
        const inspections = await QCInspection.getByGRNId(grnId);
        if (inspections && inspections.length > 0) {
            // Parse items_results if it's a string
            const inspection = inspections[0];
             if (typeof inspection.items_results === 'string') {
                 try { inspection.items_results = JSON.parse(inspection.items_results); } catch(e) {}
             }
            res.json(inspection);
        } else {
            res.status(404).json({ message: 'Inspection not found' });
        }
    } catch (error) {
         console.error('Get inspection details error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get GRN details with inspection data for viewing
exports.getGRNDetailsWithInspection = async (req, res) => {
    try {
        const { grnId } = req.params;
        const conn = await pool.getConnection();
        
        // Fetch GRN with PO and Vendor details
        const [grnRows] = await conn.query(`
            SELECT 
                grn.id,
                grn.po_id,
                grn.items,
                grn.received_quantity,
                grn.qc_status,
                grn.inspection_status,
                grn.created_at,
                po.po_number,
                v.name as vendor_name
            FROM grn
            LEFT JOIN purchase_orders po ON grn.po_id = po.id
            LEFT JOIN quotations q ON po.quotation_id = q.id
            LEFT JOIN vendors v ON q.vendor_id = v.id
            WHERE grn.id = ?
        `, [grnId]);
        
        if (!grnRows || grnRows.length === 0) {
            conn.release();
            return res.status(404).json({ message: 'GRN not found' });
        }
        
        const grn = grnRows[0];
        
        // Parse items if string
        let grnItems = [];
        if (typeof grn.items === 'string') {
            try { grnItems = JSON.parse(grn.items); } catch(e) { grnItems = []; }
        } else {
            grnItems = grn.items || [];
        }
        
        // Fetch inspection details
        const [inspectionRows] = await conn.query(`
            SELECT * FROM qc_inspections WHERE grn_id = ?
        `, [grnId]);
        
        conn.release();
        
        let inspection = null;
        let itemsResults = [];
        
        if (inspectionRows && inspectionRows.length > 0) {
            inspection = inspectionRows[0];
            if (typeof inspection.items_results === 'string') {
                try { itemsResults = JSON.parse(inspection.items_results); } catch(e) { itemsResults = []; }
            } else {
                itemsResults = inspection.items_results || [];
            }
        }
        
        // Combine GRN items with inspection results
        const itemsWithInspection = grnItems.map(item => {
            const inspectionResult = itemsResults.find(r => r.description === item.description);
            // GRN received_quantity is total accepted. 
            // We want item-level received (accepted) and rejected.
            // If inspectionResult exists, use it. Otherwise fall back to GRN item data if available or 0.
            
            return {
                ...item,
                invoice_quantity: inspectionResult?.invoice_quantity !== undefined ? inspectionResult.invoice_quantity : (item.invoice_quantity || 0),
                received: inspectionResult?.accepted !== undefined ? inspectionResult.accepted : (item.received_quantity || 0),
                rejected: inspectionResult?.rejected !== undefined ? inspectionResult.rejected : (item.rejected_quantity || 0),
                overage: inspectionResult?.overage !== undefined ? inspectionResult.overage : (item.overage_quantity || 0),
                notes: inspectionResult?.notes || item.notes || ''
            };
        });
        
        res.json({
            grn: {
                id: grn.id,
                poNumber: grn.po_number,
                vendor: grn.vendor_name,
                receivedDate: grn.created_at,
                receivedQuantity: grn.received_quantity || 0, // Handle null/undefined
                qcStatus: grn.qc_status,
                inspectionStatus: grn.inspection_status
            },
            items: itemsWithInspection,
            inspection: inspection ? {
                id: inspection.id,
                status: inspection.status,
                remarks: inspection.remarks,
                createdAt: inspection.created_at
            } : null
        });
        
    } catch (error) {
        console.error('Get GRN details with inspection error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
