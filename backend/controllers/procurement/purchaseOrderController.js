const pool = require('../../config/database');
const PurchaseOrder = require('../../models/PurchaseOrder');
const PurchaseOrderCommunication = require('../../models/PurchaseOrderCommunication');
const GRN = require('../../models/GRN');
const emailService = require('../../services/emailService');
const path = require('path');
const fs = require('fs');


exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status, vendorId } = req.query;
    const purchaseOrders = await PurchaseOrder.findAll({
      status,
      vendorId
    });
    res.json({ purchaseOrders, total: purchaseOrders.length });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await PurchaseOrder.findById(id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (purchaseOrder.items && typeof purchaseOrder.items === 'string') {
      try {
        purchaseOrder.items = JSON.parse(purchaseOrder.items);
      } catch (e) {
        console.error('Error parsing items for PO:', e);
        purchaseOrder.items = [];
      }
    }
    
    res.json(purchaseOrder);
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { 
      quotation_id, 
      material_request_id,
      vendor_id, 
      items, 
      subtotal,
      tax_amount,
      total_amount, 
      expected_delivery_date, 
      order_date,
      currency,
      tax_template,
      notes 
    } = req.body;
    
    if ((!quotation_id && !material_request_id) || !items || items.length === 0) {
      return res.status(400).json({ message: 'Quotation/Material Request ID and items are required' });
    }
    
    const purchaseOrderId = await PurchaseOrder.create({
      quotation_id,
      material_request_id,
      vendor_id,
      items,
      subtotal,
      tax_amount,
      total_amount,
      expected_delivery_date,
      order_date,
      currency,
      tax_template,
      notes,
      status: 'draft'
    });
    
    const newPurchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
    if (newPurchaseOrder && newPurchaseOrder.items && typeof newPurchaseOrder.items === 'string') {
      newPurchaseOrder.items = JSON.parse(newPurchaseOrder.items);
    }
    
    res.status(201).json(newPurchaseOrder);
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    await PurchaseOrder.update(id, updateData);
    
    const updatedPO = await PurchaseOrder.findById(id);
    if (updatedPO && updatedPO.items && typeof updatedPO.items === 'string') {
      updatedPO.items = JSON.parse(updatedPO.items);
    }
    
    res.json(updatedPO);
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    await PurchaseOrder.updateStatus(id, status);

    // Auto-create GRN if approved
    if (status === 'approved') {
      try {
        const existingGRN = await GRN.findByPoId(id);
        if (!existingGRN) {
          const po = await PurchaseOrder.findById(id);
          if (po) {
             let items = [];
             try {
                items = typeof po.items === 'string' ? JSON.parse(po.items) : (po.items || []);
             } catch (e) {
                console.error('Error parsing items for GRN:', e);
             }
             
             await GRN.create({
               po_id: po.id,
               items: items
             });
             console.log(`Auto-created GRN for PO #${po.po_number}`);
          }
        }
      } catch (grnError) {
        console.error('Error auto-creating GRN:', grnError);
        // We don't fail the request if GRN creation fails, just log it
      }
    }

    res.json({ message: 'Purchase order status updated successfully' });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;

    // Find related GRNs
    const [grns] = await conn.query('SELECT id FROM grn WHERE po_id = ?', [id]);
    
    // For each GRN, delete QC Inspections
    for (const grn of grns) {
        await conn.query('DELETE FROM qc_inspections WHERE grn_id = ?', [grn.id]);
        
        // Also delete any qc_reports if they exist (based on schema.sql)
        await conn.query('DELETE FROM qc_reports WHERE grn_id = ?', [grn.id]);
    }

    // Delete GRNs
    if (grns.length > 0) {
        await conn.query('DELETE FROM grn WHERE po_id = ?', [id]);
    }

    // Delete PO Communications if necessary (optional but good practice)
    await conn.query('DELETE FROM purchase_order_communications WHERE po_id = ?', [id]);

    // Finally delete the Purchase Order
    await conn.query('DELETE FROM purchase_orders WHERE id = ?', [id]);

    await conn.commit();
    res.json({ message: 'Purchase order and related records (GRN, QC) deleted successfully' });
  } catch (error) {
    await conn.rollback();
    console.error('Delete purchase order error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    conn.release();
  }
};

exports.getPurchaseOrderStats = async (req, res) => {
  try {
    const stats = await PurchaseOrder.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get purchase order stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getReceivedQuotes = async (req, res) => {
  try {
    const { root_card_id } = req.query;
    const quotes = await PurchaseOrder.getReceivedQuotes({
      root_card_id
    });
    
    const parsedQuotes = quotes.map(q => ({
      ...q,
      items: q.items && typeof q.items === 'string' ? JSON.parse(q.items) : q.items
    }));
    
    res.json(parsedQuotes);
  } catch (error) {
    console.error('Get received quotes error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.sendPurchaseOrderEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, pdfBase64, subject, message } = req.body;

    if (!email || !pdfBase64) {
      return res.status(400).json({ message: 'Email and PDF are required' });
    }

    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    // Convert base64 to buffer (handle data URI scheme if present)
    const base64Data = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    await emailService.sendMail({
      to: email,
      subject: subject || `Purchase Order ${purchaseOrder.po_number}`,
      text: message || `Please find attached Purchase Order ${purchaseOrder.po_number}.`,
      attachments: [
        {
          filename: `${purchaseOrder.po_number}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send PO email error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};

exports.getPurchaseOrderCommunications = async (req, res) => {
  try {
    const { id } = req.params;
    const communications = await PurchaseOrderCommunication.findByPoId(id);
    
    // Mark as read
    for (const comm of communications) {
      if (!comm.is_read) {
         PurchaseOrderCommunication.markAsRead(comm.id).catch(err => console.error('Error marking read:', err));
      }
    }
    
    res.json(communications);
  } catch (error) {
    console.error('Get PO communications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = await PurchaseOrderCommunication.getAttachmentById(id);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    
    // The file_path stored is relative to backend root (e.g. uploads/po_attachments/...)
    // We need to resolve it relative to this controller or backend root
    // Since backend is running from d:\passion\Sterling-erp\backend (probably)
    // and path.join(__dirname, '../../') puts us at backend root.
    
    const filePath = path.join(__dirname, '../../', attachment.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.download(filePath, attachment.file_name);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
