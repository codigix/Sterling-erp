const pool = require('../../config/database');
const PurchaseOrder = require('../../models/PurchaseOrder');
const PurchaseOrderCommunication = require('../../models/PurchaseOrderCommunication');
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
    
    res.json(purchaseOrder);
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { quotation_id, vendor_id, items, total_amount, expected_delivery_date, notes } = req.body;
    
    if (!quotation_id || !items || items.length === 0) {
      return res.status(400).json({ message: 'Quotation ID and items are required' });
    }
    
    const purchaseOrderId = await PurchaseOrder.create({
      quotation_id,
      vendor_id,
      items,
      total_amount,
      expected_delivery_date,
      notes,
      status: 'pending'
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

exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    await PurchaseOrder.updateStatus(id, status);
    res.json({ message: 'Purchase order status updated successfully' });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await PurchaseOrder.delete(id);
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    const { sales_order_id, project_id } = req.query;
    const quotes = await PurchaseOrder.getReceivedQuotes({
      sales_order_id,
      project_id
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
