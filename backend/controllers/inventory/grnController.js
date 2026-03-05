const GRN = require('../../models/GRN');
const PurchaseOrder = require('../../models/PurchaseOrder');
const Material = require('../../models/Material');
const StockEntry = require('../../models/StockEntry');
const RootCardInventoryTask = require('../../models/RootCardInventoryTask');
const emailService = require('../../services/emailService');

const generateVendorDiscrepancyEmail = (grnData, poData, grnItems, status) => {
  const vendorName = grnData.vendor_name || 'Valued Vendor';
  const poNumber = poData ? poData.po_number : 'Manual Receipt';
  const grnNumber = `GRN-${String(grnData.id).padStart(3, '0')}-${new Date(grnData.created_at).getFullYear()}`;
  const createdAt = grnData.created_at;

  const tableRows = grnItems.map(item => {
    const orderedQty = Number(item.quantity) || 0;
    const invoicedQty = Number(item.invoice_quantity) || 0;
    const receivedQty = Number(item.received_quantity) || 0;
    
    const diff = receivedQty - orderedQty;
    const itemStatus = diff < 0 ? 'SHORTAGE' : (diff > 0 ? 'OVERAGE' : 'OK');
    const statusColor = diff < 0 ? '#d32f2f' : (diff > 0 ? '#f57c00' : '#388e3c');
    
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.description || item.item_name || '-'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${orderedQty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${invoicedQty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${receivedQty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center; color: white; background-color: ${statusColor}; font-weight: bold;">
          ${itemStatus} (${diff > 0 ? '+' : ''}${diff})
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
        }
        p { margin: 10px 0; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th {
          background-color: #f5f5f5;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #333;
          font-weight: 600;
          color: #333;
          font-size: 13px;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
          font-size: 13px;
        }
        .status-shortage { background-color: #d32f2f; color: white; font-weight: bold; text-align: center; padding: 8px; }
        .status-overage { background-color: #f57c00; color: white; font-weight: bold; text-align: center; padding: 8px; }
        .status-ok { background-color: #388e3c; color: white; font-weight: bold; text-align: center; padding: 8px; }
      </style>
    </head>
    <body>
      <p>Dear ${vendorName},</p>

      <p>We hope this email finds you well. During our receiving and inspection process for your recent shipment, our team has identified discrepancies that require your immediate attention.</p>

      <p><strong>Reference Information:</strong></p>
      <p>
        Vendor: ${vendorName}<br>
        Purchase Order: ${poNumber}<br>
        GRN Number: ${grnNumber}<br>
        GRN Date: ${new Date(createdAt).toLocaleDateString()}<br>
        Discrepancy Type: <strong>${status.toUpperCase()}</strong>
      </p>

      <p><strong>Important Notice</strong></p>
      <p>Our receiving team has identified discrepancies between your invoice, ordered quantities, and actual received quantities. Please review the item comparison table below and contact us at your earliest convenience to resolve these issues.</p>

      <p><strong>Detailed Item Comparison</strong></p>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Ordered Qty</th>
            <th>Invoiced Qty</th>
            <th>Received Qty</th>
            <th>Status & Variance</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <p><strong>Required Action</strong></p>
      <p>Please take the following steps to resolve these discrepancies:</p>
      <ul>
        <li>Review the discrepancies listed in the table above</li>
        ${status === 'overage' ? '<li><strong>Note:</strong> Excess materials received will be adjusted in the next Purchase Order.</li>' : ''}
        <li>Confirm whether items were shipped or if there are quality issues</li>
        <li>Respond with a resolution plan (replacement, credit note, adjustment, etc.)</li>
        <li>Please reply to this email or contact us within 48 hours</li>
      </ul>

      <p>If you have any questions or need clarification, please contact your account manager immediately.</p>

      <p>Best regards,<br>
      Sterling ERP System<br>
      <br>
      <small style="color: #666;">This is an automated notification. Please do not reply to this email. Contact your account manager for assistance.</small><br>
      <small style="color: #999;">Generated on: ${new Date().toLocaleString()}</small>
      </p>
    </body>
    </html>
  `;

  return html;
};

exports.addToStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'completed', 'shortage', 'overage', 'discrepancy'

        const grn = await GRN.findById(id);
        if (!grn) {
            return res.status(404).json({ message: 'GRN not found' });
        }
        
        if (grn.qc_status === 'completed') {
            return res.status(400).json({ message: 'Stock has already been added for this GRN' });
        }

        const existingEntry = await StockEntry.findByGrnId(id);
        if (existingEntry) {
            // If entry exists but GRN status wasn't updated, update it now
            await GRN.updateStatus(id, 'completed');
            return res.status(400).json({ message: 'Stock entry already exists for this GRN' });
        }
        
        let po = null;
        if (grn.po_id) {
          po = await PurchaseOrder.findById(grn.po_id);
        }
        
        // Parse items if string
        const grnItems = typeof grn.items === 'string' ? JSON.parse(grn.items) : grn.items;

        // Auto-detect shortage/overage if status is not provided or generic
        let effectiveStatus = status ? status.toLowerCase() : 'completed';
        const hasItemShortage = grnItems.some(item => (Number(item.invoice_quantity || item.quantity) || 0) > (Number(item.received_quantity) || 0));
        const hasItemOverage = grnItems.some(item => (Number(item.received_quantity) || 0) > (Number(item.invoice_quantity || item.quantity) || 0));

        if (effectiveStatus === 'approved' || effectiveStatus === 'completed') {
            if (hasItemShortage) effectiveStatus = 'shortage';
            else if (hasItemOverage) effectiveStatus = 'overage';
        }

        // 1. Send email notification FIRST if there's a shortage, overage, or discrepancy
        if (['shortage', 'overage', 'discrepancy'].includes(effectiveStatus)) {
            const vendorEmail = grn.vendor_email || (po ? po.vendor_email : null);
            if (vendorEmail) {
                try {
                    const emailHtml = generateVendorDiscrepancyEmail(grn, po, grnItems, effectiveStatus);
                    const grnNumberFormatted = `GRN-${String(grn.id).padStart(3, '0')}-${new Date(grn.created_at).getFullYear()}`;
                    await emailService.sendMail({
                        to: vendorEmail,
                        subject: `[${grnNumberFormatted}] Discrepancy Report${po ? ` for PO ${po.po_number}` : ''}`,
                        html: emailHtml,
                        text: `Goods Received Note Discrepancy Report${po ? ` for PO ${po.po_number}` : ''}`
                    });
                    console.log(`✅ Discrepancy email sent to vendor: ${vendorEmail}`);
                } catch (emailError) {
                    console.error('Email sending failed:', emailError.message);
                }
            } else {
                console.warn('⚠️ No vendor email found for discrepancy notification');
            }
        }
        
        // 2. Add each item to inventory
        const stockEntryItems = [];
        console.log(`📦 Processing GRN #${id} for stock entry...`);
        
        for (const item of grnItems) {
            const qtyToAdd = Number(item.received_quantity) || 0;
            // Robust warehouse detection: prefer item.warehouse, then item.target_warehouse, then grn.warehouse_name
            let targetWarehouse = (item.warehouse || item.target_warehouse || grn.warehouse_name || 'Main Warehouse').trim();
            
            if (qtyToAdd > 0) {
                const itemCode = item.material_code || item.item_code || null;
                const itemName = item.material_name || item.description || item.item_name;
                
                console.log(`🔹 Item: ${itemName} | Qty: ${qtyToAdd} | Target Warehouse: ${targetWarehouse}`);
                
                let material = null;
                if (itemCode) {
                    material = await Material.findByItemCode(itemCode);
                }
                
                // Fallback to name if code match fails or doesn't exist
                if (!material && itemName) {
                    material = await Material.findByName(itemName);
                }
                
                let materialId;
                if (material) {
                    materialId = material.id;
                    console.log(`   ✅ Updating existing material: ${material.itemName} at ${targetWarehouse}`);
                    // Update the new material_stock table and inventory main table
                    await Material.updateStock(material.id, targetWarehouse, qtyToAdd, item.batch_no || null);
                } else {
                    console.log(`   🆕 Creating new material: ${itemName} at ${targetWarehouse}`);
                    materialId = await Material.create({
                        itemCode: itemCode || `MAT-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                        itemName: itemName,
                        category: item.category || 'Uncategorized',
                        quantity: 0, 
                        unit: item.unit || 'units',
                        reorderLevel: 0,
                        unitCost: item.rate || item.unit_price || 0,
                        location: targetWarehouse,
                        warehouse: targetWarehouse,
                        vendorId: grn.vendor_id || (po ? po.vendor_id : null)
                    });
                    await Material.updateStock(materialId, targetWarehouse, qtyToAdd, item.batch_no || null);
                }

                stockEntryItems.push({
                    material_id: materialId,
                    item_code: itemCode || (material ? material.itemCode : null),
                    item_name: itemName,
                    quantity: qtyToAdd,
                    unit: item.unit || (material ? material.unit : 'units'),
                    warehouse: targetWarehouse,
                    batch_no: item.batch_no || null
                });
            }
        }
        
        // 3. Create Stock Entry record for tracking
        if (stockEntryItems.length > 0) {
            // Group by warehouse for the main entry if needed, but the items have specific warehouses
            const primaryWarehouse = stockEntryItems[0].warehouse || 'Main Warehouse';
            
            await StockEntry.create({
                grn_id: id,
                entry_date: new Date(),
                entry_type: 'Material Receipt',
                to_warehouse: primaryWarehouse,
                remarks: `Stock added from GRN: ${id}. Items distributed across: ${[...new Set(stockEntryItems.map(i => i.warehouse))].join(', ')}`,
                items: stockEntryItems,
                status: 'submitted'
            });
            console.log(`✅ Stock Entry created for GRN #${id}`);
        }
        
        // 4. Update GRN status to 'completed'
        await GRN.updateStatus(id, 'completed');
        
        // 5. Update Purchase Order status to 'fulfilled'
        if (grn.po_id) {
            await PurchaseOrder.updateStatus(grn.po_id, 'fulfilled');
        }

        // 6. Handle workflow task transition
        try {
            let materialRequestId = null;
            if (grn.po_id) {
                const po = await PurchaseOrder.findById(grn.po_id);
                materialRequestId = po ? po.material_request_id : null;
            }

            if (materialRequestId) {
                const userId = req.user ? req.user.id : null;
                // Step 9 is "GRN Processing"
                await RootCardInventoryTask.completeTaskByMRAndStep(materialRequestId, 9, userId);
                // Step 11 is "Stock Addition"
                await RootCardInventoryTask.completeTaskByMRAndStep(materialRequestId, 11, userId);
                
                // Also set Step 12 "Release Material" to in_progress if it's pending
                const tasks = await RootCardInventoryTask.getTasksByMaterialRequestId(materialRequestId);
                const step12Task = tasks.find(t => t.step_number === 12 || t.step_name === 'Release Material');
                if (step12Task && step12Task.status === 'pending') {
                    await RootCardInventoryTask.updateTaskStatus(step12Task.id, 'in_progress', userId);
                }
                console.log(`[GRN-Stock] Completed "GRN Processing" and "Stock Addition" tasks for MR ${materialRequestId}`);
            }
        } catch (wfErr) {
            console.warn('[GRN-Stock] Workflow update error:', wfErr.message);
        }
        
        res.json({ message: 'Stock updated successfully' });
        
    } catch (error) {
        console.error('Add to stock error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.createGRN = async (req, res) => {
  try {
    const { po_id, vendor_id, items, qc_status, receipt_date, transporter_notes } = req.body;

    if (!po_id && !items) {
      return res.status(400).json({ message: 'Purchase Order ID or Items are required' });
    }

    // Check if GRN already exists for this PO (only if po_id is provided)
    if (po_id) {
      const existingGRN = await GRN.findByPoId(po_id);
      if (existingGRN) {
        return res.status(400).json({ message: 'GRN already exists for this Purchase Order' });
      }
    }

    // If items are not provided, fetch from PO
    let grnItems = items;
    if (!grnItems && po_id) {
      const po = await PurchaseOrder.findById(po_id);
      if (!po) {
        return res.status(404).json({ message: 'Purchase Order not found' });
      }
      grnItems = typeof po.items === 'string' ? JSON.parse(po.items) : (po.items || []);
    }

    if (!grnItems || grnItems.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Ensure material details are preserved
    grnItems = grnItems.map(item => ({
      ...item,
      material_name: item.material_name || item.description || item.item_name || item.itemName,
      material_code: item.material_code || item.item_code || item.itemCode,
      description: item.material_name || item.description || item.item_name || item.itemName,
      item_code: item.material_code || item.item_code || item.itemCode,
      category: item.category || item.item_group || item.material_type || "-",
      warehouse: item.warehouse || "Main Warehouse"
    }));

    const grnId = await GRN.create({
      po_id: po_id || null,
      vendor_id: vendor_id || null,
      items: grnItems,
      qc_status: 'pending_approval', // Set to pending_approval for initial state
      receipt_date,
      transporter_notes
    });

    // Update Purchase Order status to 'goods arrival'
    if (po_id) {
      await PurchaseOrder.updateStatus(po_id, 'goods arrival');
      
      // Handle workflow task transition
      try {
        const po = await PurchaseOrder.findById(po_id);
        if (po && po.material_request_id) {
          const userId = req.user ? req.user.id : null;
          // Step 8 is "Receive Material"
          await RootCardInventoryTask.completeTaskByMRAndStep(po.material_request_id, 8, userId);
          
          // Link GRN to Step 9, 10, 11 tasks
          const tasks = await RootCardInventoryTask.getTasksByMaterialRequestId(po.material_request_id);
          const stepsToLink = [
            { num: 9, name: 'GRN Processing' },
            { num: 10, name: 'QC Inspection' },
            { num: 11, name: 'Stock Addition' }
          ];
          for (const step of stepsToLink) {
            const task = tasks.find(t => t.step_number === step.num || t.step_name === step.name);
            if (task) {
              await RootCardInventoryTask.updateTaskWithReference(task.id, grnId, 'grn', task.status);
            }
          }

          // Also set Step 9 "GRN Processing" to in_progress if it's pending
          const step9Task = tasks.find(t => t.step_number === 9 || t.step_name === 'GRN Processing');
          if (step9Task && step9Task.status === 'pending') {
            await RootCardInventoryTask.updateTaskStatus(step9Task.id, 'in_progress', userId);
          }
          console.log(`[GRN-Create] Automatically completed "Receive Material" task for MR ${po.material_request_id}`);
        }
      } catch (wfErr) {
        console.warn('[GRN-Create] Workflow update error:', wfErr.message);
      }
    }

    const newGRN = await GRN.findById(grnId);
    newGRN.items = typeof newGRN.items === 'string' ? JSON.parse(newGRN.items) : newGRN.items;

    res.status(201).json(newGRN);
  } catch (error) {
    console.error('Create GRN error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getAllGRNs = async (req, res) => {
  try {
    const { status } = req.query;
    const grns = await GRN.findAll({ status });
    
    // Parse items if they are stored as JSON string
    const parsedGRNs = grns.map(grn => ({
      ...grn,
      items: typeof grn.items === 'string' ? JSON.parse(grn.items) : grn.items
    }));
    
    res.json(parsedGRNs);
  } catch (error) {
    console.error('Get all GRNs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getGRNById = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findById(id);
    
    if (!grn) {
      return res.status(404).json({ message: 'GRN not found' });
    }
    
    grn.items = typeof grn.items === 'string' ? JSON.parse(grn.items) : grn.items;
    
    res.json(grn);
  } catch (error) {
    console.error('Get GRN error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.approveGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findById(id);
    
    if (!grn) {
      return res.status(404).json({ message: 'GRN not found' });
    }
    
    // Transition from pending_approval to pending (ready for inspection)
    await GRN.updateStatus(id, 'pending');

    // Handle workflow task transition
    try {
      if (grn.po_id) {
        const po = await PurchaseOrder.findById(grn.po_id);
        if (po && po.material_request_id) {
          const userId = req.user ? req.user.id : null;
          // Step 9 is "GRN Processing"
          await RootCardInventoryTask.completeTaskByMRAndStep(po.material_request_id, 9, userId);
          
          // Set Step 10 "QC Inspection" to in_progress if it's pending
          const tasks = await RootCardInventoryTask.getTasksByMaterialRequestId(po.material_request_id);
          const step10Task = tasks.find(t => t.step_number === 10 || t.step_name === 'QC Inspection');
          if (step10Task && step10Task.status === 'pending') {
            await RootCardInventoryTask.updateTaskStatus(step10Task.id, 'in_progress', userId);
          }
          
          // Sync overall workflow
          await RootCardInventoryTask.syncMRWorkflow(po.material_request_id);
          
          console.log(`[GRN-Approval] Automatically completed "GRN Processing" task for MR ${po.material_request_id}`);
        }
      }
    } catch (wfErr) {
      console.warn('[GRN-Approval] Workflow update error:', wfErr.message);
    }
    
    res.json({ message: 'GRN approved and moved to QC Inspection' });
  } catch (error) {
    console.error('Approve GRN error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateGRNStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    await GRN.updateStatus(id, status);
    
    res.json({ message: 'GRN status updated successfully' });
  } catch (error) {
    console.error('Update GRN status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
