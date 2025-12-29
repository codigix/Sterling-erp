const db = require('../config/database');

class PurchaseOrderCommunication {
  static async create(data) {
    const { po_id, sender_email, subject, content_text, content_html, message_id, has_attachments } = data;
    const query = `
      INSERT INTO purchase_order_communications 
      (po_id, sender_email, subject, content_text, content_html, message_id, has_attachments) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      po_id, sender_email, subject, content_text, content_html, message_id, has_attachments
    ]);
    return result.insertId;
  }

  static async addAttachment(communicationId, fileData) {
    const { fileName, filePath, fileSize, mimeType } = fileData;
    const query = `
      INSERT INTO purchase_order_attachments (communication_id, file_name, file_path, file_size, mime_type)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(query, [communicationId, fileName, filePath, fileSize, mimeType]);
  }

  static async findByPoId(poId) {
    const query = `
      SELECT c.*, a.id as att_id, a.file_name, a.file_path, a.file_size, a.mime_type
      FROM purchase_order_communications c
      LEFT JOIN purchase_order_attachments a ON c.id = a.communication_id
      WHERE c.po_id = ? 
      ORDER BY c.received_at DESC
    `;
    const [rows] = await db.execute(query, [poId]);
    
    // Group attachments by communication
    const communicationsMap = new Map();
    
    for (const row of rows) {
      if (!communicationsMap.has(row.id)) {
        communicationsMap.set(row.id, {
          id: row.id,
          po_id: row.po_id,
          sender_email: row.sender_email,
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
    const query = `UPDATE purchase_order_communications SET is_read = TRUE WHERE id = ?`;
    await db.execute(query, [id]);
  }
  
  static async exists(messageId) {
    const query = `SELECT id FROM purchase_order_communications WHERE message_id = ?`;
    const [rows] = await db.execute(query, [messageId]);
    return rows.length > 0;
  }

  static async getAttachmentById(id) {
    const query = `SELECT * FROM purchase_order_attachments WHERE id = ?`;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
}

module.exports = PurchaseOrderCommunication;
