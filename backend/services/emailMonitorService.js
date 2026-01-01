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

// Helper function to parse email replies since 'email-reply-parser' is an ES module
// and we are using CommonJS. We'll implement a basic regex parser instead.
function getVisibleText(text) {
  if (!text) return '';
  
  // Split into lines
  const lines = text.split(/\r?\n/);
  const visibleLines = [];
  
  // Common patterns for the start of the quoted text
  const quoteHeaders = [
    /^On\s.*wrote:$/i, // Gmail: On Mon, Jan 1... wrote:
    /^-----Original Message-----/i, // Outlook
    /^From:\s/i,
    /^________________________________/
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if line starts with >
    if (trimmed.startsWith('>')) {
      continue;
    }
    
    // Check if line matches any quote header
    let isQuoteHeader = false;
    for (const pattern of quoteHeaders) {
      if (pattern.test(trimmed)) {
        isQuoteHeader = true;
        break;
      }
    }
    
    if (isQuoteHeader) {
      // If we hit a quote header, assume everything after is also part of the quote
      // But we should verify if we have collected some text already.
      // Usually the reply is at the top.
      break; 
    }
    
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
        authTimeout: 20000
      }
    };
    this.checkInterval = 60 * 1000; // Check every 1 minute
    this.isRunnning = false;
    this.timer = null;
  }

  start() {
    if (this.isRunnning) return;
    console.log('📧 Starting Email Monitor Service...');
    this.isRunnning = true;
    this.checkEmails();
    this.timer = setInterval(() => this.checkEmails(), this.checkInterval);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.isRunnning = false;
    console.log('📧 Email Monitor Service stopped');
  }

  async checkEmails() {
    let connection;
    try {
      connection = await imaps.connect(this.config);

      // Handle connection errors to prevent crash
      connection.on('error', (err) => {
        console.error('❌ IMAP Connection Error:', err);
      });

      await connection.openBox('INBOX');

      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      const searchCriteria = [
        ['OR', ['SUBJECT', 'QT-'], ['SUBJECT', 'PO-']]
      ];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      const recentMessages = messages.filter(item => {
        try {
          const headerPart = item.parts.find(p => p.which === 'HEADER');
          const date = new Date(headerPart.body.date[0]).getTime();
          return date >= oneHourAgo;
        } catch (e) {
          return false;
        }
      });

      console.log(`📬 Found ${recentMessages.length} recent emails with QT/PO in subject`);

      for (const item of recentMessages) {
        const subject = item.parts.find(p => p.which === 'HEADER').body.subject[0];
        
        // Look for PO number in subject: PO-timestamp-random
        const poMatch = subject.match(/PO-\d+-\d+/);
        // Look for QT number in subject: QT-timestamp-random
        const qtMatch = subject.match(/QT-\d+-\d+/);
        
        if (poMatch) {
          const poNumber = poMatch[0];
          console.log(`🔎 Found potential PO reply for ${poNumber}`);
          
          const po = await PurchaseOrder.findByPoNumber(poNumber);
          
          if (po) {
            console.log(`✅ Matched to PO ID: ${po.id}`);
            
            // Let's do a specific fetch for this message to get full content
            const fullMessage = await connection.search([['UID', item.attributes.uid]], { bodies: [''], markSeen: true });
             
            if (fullMessage.length > 0) {
              const source = fullMessage[0].parts[0].body;
              const parsed = await simpleParser(source);
              
              const exists = await PurchaseOrderCommunication.exists(parsed.messageId);
              
              if (!exists) {
                // Parse the email to get only the visible reply text
                const visibleText = getVisibleText(parsed.text);

                const communicationId = await PurchaseOrderCommunication.create({
                  po_id: po.id,
                  sender_email: parsed.from.value[0].address,
                  subject: parsed.subject,
                  content_text: visibleText, // Save only the visible text
                  content_html: parsed.html, 
                  message_id: parsed.messageId,
                  has_attachments: parsed.attachments && parsed.attachments.length > 0
                });

                // Save attachments if any
                if (parsed.attachments && parsed.attachments.length > 0) {
                   const uploadDir = path.join(__dirname, '../uploads/po_attachments');
                   if (!fs.existsSync(uploadDir)) {
                     fs.mkdirSync(uploadDir, { recursive: true });
                   }

                   for (const attachment of parsed.attachments) {
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
                        console.log(`📎 Attachment saved: ${uniqueFileName}`);
                     } catch (attError) {
                       console.error('❌ Failed to save attachment:', attError);
                     }
                   }
                }

                console.log(`💾 Saved reply for PO ${poNumber}`);

                // Send notifications to Admin and Procurement Manager
                try {
                  const users = await User.findAll();
                  const recipients = users.filter(u => 
                    u.role_name === 'Admin' || u.role_name === 'Procurement Manager'
                  );

                  for (const user of recipients) {
                    await Notification.create({
                      userId: user.id,
                      message: `New reply received for ${poNumber} from ${parsed.from.value[0].address}`,
                      type: 'info',
                      relatedId: po.id,
                      relatedType: 'purchase_order'
                    });
                  }
                  console.log(`🔔 Notifications sent to ${recipients.length} users`);
                } catch (notifError) {
                  console.error('❌ Failed to send notifications:', notifError);
                }

              } else {
                console.log(`⚠️ Message ${parsed.messageId} already exists`);
              }
            }
          }
        } else if (qtMatch) {
          const qtNumber = qtMatch[0];
          console.log(`🔎 Found potential Quotation reply for ${qtNumber}`);
          
          const quotation = await Quotation.findByQuotationNumber(qtNumber);
          
          if (quotation) {
            console.log(`✅ Matched to Quotation ID: ${quotation.id}`);
            
            // Let's do a specific fetch for this message to get full content
            const fullMessage = await connection.search([['UID', item.attributes.uid]], { bodies: [''], markSeen: true });
             
            if (fullMessage.length > 0) {
              const source = fullMessage[0].parts[0].body;
              const parsed = await simpleParser(source);
              
              const exists = await QuotationCommunication.exists(parsed.messageId);
              
              if (!exists) {
                // Parse the email to get only the visible reply text
                const visibleText = getVisibleText(parsed.text);

                const communicationId = await QuotationCommunication.create({
                  quotation_id: quotation.id,
                  sender_email: parsed.from.value[0].address,
                  subject: parsed.subject,
                  content_text: visibleText, // Save only the visible text
                  content_html: parsed.html, 
                  message_id: parsed.messageId,
                  has_attachments: parsed.attachments && parsed.attachments.length > 0
                });

                // Save attachments if any
                if (parsed.attachments && parsed.attachments.length > 0) {
                   const uploadDir = path.join(__dirname, '../uploads/quotation_attachments');
                   if (!fs.existsSync(uploadDir)) {
                     fs.mkdirSync(uploadDir, { recursive: true });
                   }

                   for (const attachment of parsed.attachments) {
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
                        console.log(`📎 Attachment saved: ${uniqueFileName}`);
                     } catch (attError) {
                       console.error('❌ Failed to save attachment:', attError);
                     }
                   }
                }

                console.log(`💾 Saved reply for Quotation ${qtNumber}`);

                // Send notifications to Admin and Procurement Manager
                try {
                  const users = await User.findAll();
                  const recipients = users.filter(u => 
                    u.role_name === 'Admin' || u.role_name === 'Procurement Manager'
                  );

                  for (const user of recipients) {
                    await Notification.create({
                      userId: user.id,
                      message: `New reply received for ${qtNumber} from ${parsed.from.value[0].address}`,
                      type: 'info',
                      relatedId: quotation.id,
                      relatedType: 'quotation'
                    });
                  }
                  console.log(`🔔 Notifications sent to ${recipients.length} users`);
                } catch (notifError) {
                  console.error('❌ Failed to send notifications:', notifError);
                }

              } else {
                console.log(`⚠️ Message ${parsed.messageId} already exists`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Email Monitor Error:', error.message);
      // Don't crash the loop
    } finally {
      if (connection) {
        try {
          connection.end(); 
        } catch (e) {
          console.error('Error closing connection:', e);
        }
      }
    }
  }
}

module.exports = new EmailMonitorService();
