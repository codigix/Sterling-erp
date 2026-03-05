const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseOrderCommunication = require('../models/PurchaseOrderCommunication');
const Quotation = require('../models/Quotation');
const QuotationCommunication = require('../models/QuotationCommunication');
const Notification = require('../models/Notification');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Helper function to parse email replies
function getVisibleText(text) {
  if (!text) return '';
  
  const lines = text.split(/\r?\n/);
  const visibleLines = [];
  
  const quoteHeaders = [
    /^On\s.*wrote:$/i,
    /^-----Original Message-----/i,
    /^From:\s/i,
    /^________________________________/
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('>')) continue;
    
    let isQuoteHeader = false;
    for (const pattern of quoteHeaders) {
      if (pattern.test(trimmed)) {
        isQuoteHeader = true;
        break;
      }
    }
    
    if (isQuoteHeader) break; 
    visibleLines.push(line);
  }
  
  return visibleLines.join('\n').trim();
}

class EmailMonitorService {
  constructor() {
    this.config = {
      imap: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
        host: process.env.EMAIL_HOST === 'smtp.gmail.com' ? 'imap.gmail.com' : (process.env.IMAP_HOST || 'imap.gmail.com'),
        port: parseInt(process.env.IMAP_PORT || '993'),
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 30000,
        connTimeout: 30000
      }
    };
    this.checkInterval = 60 * 1000; // Check every 60 seconds
    this.isRunning = false;
    this.isProcessing = false;
    this.timer = null;
  }

  start() {
    if (this.isRunning) return;
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_USER === 'undefined' || process.env.EMAIL_PASS === 'undefined' ||
        process.env.EMAIL_USER === '' || process.env.EMAIL_PASS === '') {
      console.warn('📧 Email Monitor Service: EMAIL_USER or EMAIL_PASS not configured. Skipping start.');
      return;
    }

    console.log('📧 Starting Email Monitor Service (15s interval)...');
    this.isRunning = true;
    
    this.runCheck();
    this.timer = setInterval(() => this.runCheck(), this.checkInterval);
  }

  async runCheck() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    try {
      await this.checkEmails();
    } catch (err) {
      console.error('❌ Email Monitor Check Error:', err.message);
    } finally {
      this.isProcessing = false;
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = false;
    this.isProcessing = false;
    console.log('📧 Email Monitor Service stopped');
  }

  async checkEmails() {
    let connection;
    try {
      connection = await imaps.connect(this.config);

      if (connection && connection.imap) {
        connection.imap.removeAllListeners('error');
        connection.imap.on('error', (err) => {
          console.error('📧 Underlying IMAP Connection Error:', err.message);
        });
      }

      await connection.openBox('INBOX');

      const searchPeriod = 3 * 24 * 60 * 60 * 1000;
      const threeDaysAgo = new Date(Date.now() - searchPeriod);
      
      const searchCriteria = [
        'UNSEEN',
        ['SINCE', threeDaysAgo.toISOString()]
      ];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      if (messages.length === 0) {
        if (connection && connection.imap && connection.imap.state !== 'disconnected') {
          await connection.end();
        }
        return;
      }

      console.log(`📬 Found ${messages.length} potential emails to process.`);

      for (const item of messages) {
        try {
          const headerPart = item.parts.find(p => p.which === 'HEADER');
          if (!headerPart || !headerPart.body || !headerPart.body.subject) continue;
          
          const subject = headerPart.body.subject[0];
          const messageId = headerPart.body['message-id'] ? headerPart.body['message-id'][0] : null;
          const from = headerPart.body.from ? headerPart.body.from[0] : '';
          
          if (!messageId) continue;

          const poRegex = /(PO-(?:MR-)?[A-Z0-9-]+)/i;
          const qtRegex = /((?:QT|RFQ)-(?:MRS-)?[A-Z0-9-]+)/i;
          
          const poMatch = subject.match(poRegex);
          const qtMatch = subject.match(qtRegex);
          
          if (poMatch) {
            const poNumber = poMatch[1].toUpperCase();
            if (await PurchaseOrderCommunication.exists(messageId)) continue;

            const po = await PurchaseOrder.findByPoNumber(poNumber);
            if (po) await this.processPoEmail(connection, item, po, messageId);
          } else if (qtMatch) {
            const qtNumber = qtMatch[1].toUpperCase();
            if (await QuotationCommunication.exists(messageId)) continue;

            const quotation = await Quotation.findByQuotationNumber(qtNumber);
            if (quotation) await this.processQuotationEmail(connection, item, quotation, messageId);
          }
        } catch (itemError) {
          console.error(`❌ Error processing email item: ${itemError.message}`);
        }
      }

      if (connection && connection.imap && connection.imap.state !== 'disconnected') {
        await connection.end();
      }
    } catch (error) {
      if (connection && connection.imap && connection.imap.state !== 'disconnected') {
        await connection.end().catch(() => {});
      }
      throw error;
    }
  }

  async processPoEmail(connection, item, po, messageId) {
    try {
      const fullMessage = await connection.search([['UID', item.attributes.uid]], { bodies: [''], markSeen: true });
      if (fullMessage.length === 0) return;

      const source = fullMessage[0].parts[0].body;
      const parsed = await simpleParser(source);
      const visibleText = getVisibleText(parsed.text);
      const senderEmail = parsed.from.value[0].address;

      const communicationId = await PurchaseOrderCommunication.create({
        po_id: po.id,
        sender_email: senderEmail,
        subject: parsed.subject,
        content_text: visibleText,
        content_html: parsed.html, 
        message_id: messageId,
        has_attachments: parsed.attachments && parsed.attachments.length > 0
      });

      if (parsed.attachments && parsed.attachments.length > 0) {
        await this.savePoAttachments(communicationId, parsed.attachments);
      }

      console.log(`✨ Saved communication for PO ${po.po_number}`);
      await this.notifyUsers('purchase_order', po.id, po.po_number, senderEmail);
    } catch (err) {
      console.error(`❌ Error processing PO email for ${po.po_number}:`, err.message);
    }
  }

  async processQuotationEmail(connection, item, quotation, messageId) {
    try {
      const fullMessage = await connection.search([['UID', item.attributes.uid]], { bodies: [''], markSeen: true });
      if (fullMessage.length === 0) return;

      const source = fullMessage[0].parts[0].body;
      const parsed = await simpleParser(source);
      const visibleText = getVisibleText(parsed.text);
      const senderEmail = parsed.from.value[0].address;

      const communicationId = await QuotationCommunication.create({
        quotation_id: quotation.id,
        sender_email: senderEmail,
        subject: parsed.subject,
        content_text: visibleText,
        content_html: parsed.html, 
        message_id: messageId,
        has_attachments: parsed.attachments && parsed.attachments.length > 0
      });

      if (parsed.attachments && parsed.attachments.length > 0) {
        await this.saveQuotationAttachments(communicationId, parsed.attachments);
      }

      console.log(`✨ Saved communication for Quotation ${quotation.quotation_number}`);
      await this.notifyUsers('quotation', quotation.id, quotation.quotation_number, senderEmail);
    } catch (err) {
      console.error(`❌ Error processing Quotation email for ${quotation.quotation_number}:`, err.message);
    }
  }

  async savePoAttachments(communicationId, attachments) {
    const uploadDir = path.join(__dirname, '../uploads/po_attachments');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (const attachment of attachments) {
      try {
        const fileName = attachment.filename || 'unknown';
        const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        fs.writeFileSync(filePath, attachment.content);
        
        await PurchaseOrderCommunication.addAttachment(communicationId, {
          fileName: fileName,
          filePath: `uploads/po_attachments/${uniqueFileName}`,
          fileSize: attachment.size,
          mimeType: attachment.contentType
        });
      } catch (attError) {
        console.error('❌ Failed to save PO attachment:', attError.message);
      }
    }
  }

  async saveQuotationAttachments(communicationId, attachments) {
    const uploadDir = path.join(__dirname, '../uploads/quotation_attachments');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (const attachment of attachments) {
      try {
        const fileName = attachment.filename || 'unknown';
        const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        fs.writeFileSync(filePath, attachment.content);
        
        await QuotationCommunication.addAttachment(communicationId, {
          fileName: fileName,
          filePath: `uploads/quotation_attachments/${uniqueFileName}`,
          fileSize: attachment.size,
          mimeType: attachment.contentType
        });
      } catch (attError) {
        console.error('❌ Failed to save Quotation attachment:', attError.message);
      }
    }
  }

  async notifyUsers(type, id, number, sender) {
    try {
      const users = await User.findAll();
      const roles = ['Admin', 'Procurement Manager', 'Inventory Manager', 'Production Manager'];
      const recipients = users.filter(u => roles.some(role => u.role_name && u.role_name.toLowerCase().includes(role.toLowerCase())));

      for (const user of recipients) {
        await Notification.create({
          userId: user.id,
          message: `New email reply for ${number} from ${sender}`,
          type: 'info',
          relatedId: id,
          relatedType: type
        });
      }
    } catch (notifError) {
      console.error('❌ Failed to send notifications:', notifError.message);
    }
  }
}

module.exports = new EmailMonitorService();
