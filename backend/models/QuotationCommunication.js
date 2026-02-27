const db = require('../config/database');

class QuotationCommunication {
  static async create(data) {
    const { quotation_id, sender_email, subject, content_text, content_html, message_id, has_attachments } = data;
    const query = `
      INSERT INTO quotation_communications 
      (quotation_id, sender_email, subject, content_text, content_html, message_id, has_attachments) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      quotation_id, sender_email, subject, content_text, content_html, message_id, has_attachments
    ]);
    return result.insertId;
  }

  static async addAttachment(communicationId, fileData) {
    const { fileName, filePath, fileSize, mimeType } = fileData;
    const query = `
      INSERT INTO quotation_attachments (communication_id, file_name, file_path, file_size, mime_type)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(query, [communicationId, fileName, filePath, fileSize, mimeType]);
  }

  static async findByQuotationId(quotationId) {
    const query = `
      SELECT c.*, a.id as att_id, a.file_name, a.file_path, a.file_size, a.mime_type, v.name as vendor_name
      FROM quotation_communications c
      LEFT JOIN quotation_attachments a ON c.id = a.communication_id
      LEFT JOIN quotations q ON c.quotation_id = q.id
      LEFT JOIN vendors v ON q.vendor_id = v.id
      WHERE c.quotation_id = ? 
      ORDER BY c.received_at DESC
    `;
    const [rows] = await db.execute(query, [quotationId]);
    
    const communicationsMap = new Map();
    
    for (const row of rows) {
      if (!communicationsMap.has(row.id)) {
        communicationsMap.set(row.id, {
          id: row.id,
          quotation_id: row.quotation_id,
          sender_email: row.sender_email,
          vendor_name: row.vendor_name,
          subject: row.subject,
          content_text: row.content_text,
          content_html: row.content_html,
          message_id: row.message_id,
          received_at: row.received_at,
          is_read: row.is_read,
          has_attachments: row.has_attachments,
          created_at: row.created_at,
          attachments: []
        });
      }
      
      if (row.att_id) {
        communicationsMap.get(row.id).attachments.push({
          id: row.att_id,
          file_name: row.file_name,
          file_path: row.file_path,
          file_size: row.file_size,
          mime_type: row.mime_type
        });
      }
    }
    
    return Array.from(communicationsMap.values());
  }

  static async markAsRead(id) {
    const query = `UPDATE quotation_communications SET is_read = TRUE WHERE id = ?`;
    await db.execute(query, [id]);
  }

  static async markAllAsReadForQuotation(quotationId) {
    const query = `UPDATE quotation_communications SET is_read = TRUE WHERE quotation_id = ? AND is_read = FALSE`;
    await db.execute(query, [quotationId]);
  }
  
  static async exists(messageId) {
    const query = `SELECT id FROM quotation_communications WHERE message_id = ?`;
    const [rows] = await db.execute(query, [messageId]);
    return rows.length > 0;
  }

  static async getAttachmentById(id) {
    const query = `SELECT * FROM quotation_attachments WHERE id = ?`;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
}

module.exports = QuotationCommunication;
