const GRN = require('../../models/GRN');
const PurchaseOrder = require('../../models/PurchaseOrder');
const Material = require('../../models/Material');
const emailService = require('../../services/emailService');

const generateVendorDiscrepancyEmail = (grnData, poData, grnItems, status) => {
  const vendorName = grnData.vendor_name || 'Valued Vendor';
  const poNumber = poData.po_number;
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
        
        const po = await PurchaseOrder.findById(grn.po_id);
        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }
        
        // Parse items if string
        const grnItems = typeof grn.items === 'string' ? JSON.parse(grn.items) : grn.items;
        
        // Add each item to inventory
        for (const item of grnItems) {
            const qtyToAdd = Number(item.received_quantity) || 0;
            
            if (qtyToAdd > 0) {
                const itemCode = item.item_code || null;
                const itemName = item.description || item.item_name;
                
                let material = null;
                if (itemCode) {
                    material = await Material.findByItemCode(itemCode);
                } else if (itemName) {
                    material = await Material.findByName(itemName);
                }
                
                if (material) {
                    const newQty = (Number(material.quantity) || 0) + qtyToAdd;
                    await Material.updateQuantity(material.id, newQty);
                } else {
                    await Material.create({
                        itemCode: itemCode || `MAT-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                        itemName: itemName,
                        category: item.category || 'Uncategorized',
                        quantity: qtyToAdd,
                        unit: item.unit || 'units',
                        reorderLevel: 0,
                        unitCost: item.unit_price || 0,
                        location: 'Default Store',
                        vendorId: po.vendor_id || null
                    });
                }
            }
        }
        
        // Send email notification if there's a shortage, overage, or discrepancy
        if (status && ['shortage', 'overage', 'discrepancy'].includes(status.toLowerCase())) {
            if (po.vendor_email) {
                try {
                    const emailHtml = generateVendorDiscrepancyEmail(grn, po, grnItems, status);
                    const grnNumberFormatted = `GRN-${String(grn.id).padStart(3, '0')}-${new Date(grn.created_at).getFullYear()}`;
                    await emailService.sendMail({
                        to: po.vendor_email,
                        subject: `[${grnNumberFormatted}] Discrepancy Report for PO ${po.po_number}`,
                        html: emailHtml,
                        text: `Goods Received Note Discrepancy Report for PO ${po.po_number}`
                    });
                    console.log(`✅ Discrepancy email sent to vendor: ${po.vendor_email}`);
                } catch (emailError) {
                    console.error('Email sending failed:', emailError.message);
                }
            }
        }
        
        // Update GRN status to 'completed'
        await GRN.updateStatus(id, 'completed');
        
        res.json({ message: 'Stock updated successfully' });
        
    } catch (error) {
        console.error('Add to stock error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.createGRN = async (req, res) => {
  try {
    const { po_id, items, qc_status } = req.body;

    if (!po_id) {
      return res.status(400).json({ message: 'Purchase Order ID is required' });
    }

    // Check if GRN already exists for this PO
    const existingGRN = await GRN.findByPoId(po_id);
    if (existingGRN) {
      return res.status(400).json({ message: 'GRN already exists for this Purchase Order' });
    }

    // If items are not provided, fetch from PO
    let grnItems = items;
    if (!grnItems) {
      const po = await PurchaseOrder.findById(po_id);
      if (!po) {
        return res.status(404).json({ message: 'Purchase Order not found' });
      }
      grnItems = typeof po.items === 'string' ? JSON.parse(po.items) : (po.items || []);
    }

    const grnId = await GRN.create({
      po_id,
      items: grnItems,
      qc_status: qc_status || 'pending'
    });

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
