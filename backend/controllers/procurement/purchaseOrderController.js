const pool = require('../../config/database');
const PurchaseOrder = require('../../models/PurchaseOrder');
const PurchaseOrderCommunication = require('../../models/PurchaseOrderCommunication');
const GRN = require('../../models/GRN');
const emailService = require('../../services/emailService');
const WorkflowTaskHelper = require('../../utils/workflowTaskHelper');
const MaterialRequest = require('../../models/MaterialRequest');
const RootCardInventoryTask = require('../../models/RootCardInventoryTask');
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

    // Handle workflow task transition
    if (material_request_id) {
      try {
        const userId = req.user ? req.user.id : null;
        const mr = await MaterialRequest.findById(material_request_id);
        
        if (mr) {
          // 1. Update RootCardInventoryTask (Modern Inventory Workflow)
          // Step 5 is "Create Purchase Order"
          await RootCardInventoryTask.completeTaskByMRAndStep(material_request_id, 5, userId);
          
          // Link PO to Step 5, 6, 7, 8 tasks
          const tasks = await RootCardInventoryTask.getTasksByMaterialRequestId(material_request_id);
          const stepsToLink = [5, 6, 7, 8];
          for (const stepNum of stepsToLink) {
            const task = tasks.find(t => t.step_number === stepNum);
            if (task) {
              await RootCardInventoryTask.updateTaskWithReference(task.id, purchaseOrderId, 'purchase_order', task.status);
            }
          }
          
          // Also set Step 6 "Send PO to Vendor" to in_progress if it's pending
          const step6Task = tasks.find(t => t.step_number === 6 || t.step_name === 'Send PO to Vendor');
          if (step6Task && step6Task.status === 'pending') {
            await RootCardInventoryTask.updateTaskStatus(step6Task.id, 'in_progress', userId);
          }
          console.log(`[PO] Automatically completed "Create Purchase Order" task for MR ${material_request_id}`);

          // 2. Legacy/Standard Workflow transition
          if (mr.sales_order_id) {
            // If a PO is created, we transition from RFQ/Quotation steps to PO creation
            await WorkflowTaskHelper.completeAndOpenNext(mr.sales_order_id, 'Record & Approve Vendor Quotation', null);
          }
        }
      } catch (wfError) {
        console.warn('Workflow transition error:', wfError.message);
      }
    }
    
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
    
    // Handle workflow task transition if PO is approved
    if (status === 'approved') {
      try {
        const purchaseOrder = await PurchaseOrder.findById(id);
        
        if (purchaseOrder && purchaseOrder.material_request_id) {
          const userId = req.user ? req.user.id : null;
          // Step 7 is "Approve Purchase Order"
          await RootCardInventoryTask.completeTaskByMRAndStep(purchaseOrder.material_request_id, 7, userId);
          
          // Also set Step 8 "Receive Material" to in_progress if it's pending
          const tasks = await RootCardInventoryTask.getTasksByMaterialRequestId(purchaseOrder.material_request_id);
          const step8Task = tasks.find(t => t.step_number === 8 || t.step_name === 'Receive Material');
          if (step8Task && step8Task.status === 'pending') {
            await RootCardInventoryTask.updateTaskStatus(step8Task.id, 'in_progress', userId);
          }
          
          // Sync overall workflow
          await RootCardInventoryTask.syncMRWorkflow(purchaseOrder.material_request_id);
          
          console.log(`[PO-Approval] Automatically completed "Approve Purchase Order" task for MR ${purchaseOrder.material_request_id}`);
        }
      } catch (wfErr) {
        console.error('[PO-Approval] Workflow update error:', wfErr);
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

    const result = await emailService.sendMail({
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

    if (result.success) {
      // Save outgoing communication
      try {
        const communicationId = await PurchaseOrderCommunication.create({
          po_id: id,
          sender_email: process.env.EMAIL_USER,
          subject: subject || `Purchase Order ${purchaseOrder.po_number}`,
          content_text: message || `Please find attached Purchase Order ${purchaseOrder.po_number}.`,
          content_html: null,
          message_id: result.messageId,
          has_attachments: true
        });

        // Save PDF as attachment
        const uploadDir = path.join(__dirname, '../../uploads/po_attachments');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${purchaseOrder.po_number}.pdf`;
        const uniqueFileName = `${Date.now()}-${fileName}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        
        fs.writeFileSync(filePath, pdfBuffer);
        
        await PurchaseOrderCommunication.addAttachment(communicationId, {
          fileName: fileName,
          filePath: `uploads/po_attachments/${uniqueFileName}`,
          fileSize: pdfBuffer.length,
          mimeType: 'application/pdf'
        });
        
        // Mark as read since we sent it
        await PurchaseOrderCommunication.markAsRead(communicationId);
        
        // Handle workflow task transition for modern inventory workflow
        if (purchaseOrder.material_request_id) {
          try {
            const userId = req.user ? req.user.id : null;
            // Step 6 is "Send PO to Vendor"
            await RootCardInventoryTask.completeTaskByMRAndStep(purchaseOrder.material_request_id, 6, userId);
            
            // Also set Step 7 "Approve Purchase Order" to in_progress if it's pending and link PO
            const tasks = await RootCardInventoryTask.getTasksByMaterialRequestId(purchaseOrder.material_request_id);
            const step7Task = tasks.find(t => t.step_number === 7 || t.step_name === 'Approve Purchase Order');
            if (step7Task) {
              await RootCardInventoryTask.updateTaskWithReference(step7Task.id, id, 'purchase_order', 
                step7Task.status === 'pending' ? 'in_progress' : step7Task.status
              );
            }
            console.log(`[PO-Email] Automatically completed "Send PO to Vendor" task for MR ${purchaseOrder.material_request_id}`);
          } catch (wfErr) {
            console.warn('[PO-Email] Workflow update error:', wfErr.message);
          }
        }
      } catch (dbError) {
        console.error('Error saving outgoing PO communication:', dbError);
        // Don't fail the request if just saving to history fails
      }
    }

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
    
    // Mark as read and add is_outgoing flag
    const processedComms = communications.map(comm => ({
      ...comm,
      is_outgoing: comm.sender_email === process.env.EMAIL_USER
    }));

    for (const comm of processedComms) {
      if (!comm.is_read && !comm.is_outgoing) {
         PurchaseOrderCommunication.markAsRead(comm.id).catch(err => console.error('Error marking read:', err));
      }
    }
    
    res.json(processedComms);
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
