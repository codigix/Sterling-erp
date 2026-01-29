const pool = require('../config/database');

class EngineeringDocument {
  static async create(data, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        rootCardId,
        documentType,
        documentName,
        filePath,
        uploadedBy
      } = data;

      const [result] = await conn.query(
        `INSERT INTO engineering_documents 
        (sales_order_id, document_type, document_name, file_path, uploaded_by, status)
        VALUES (?, ?, ?, ?, ?, 'draft')`,
        [rootCardId, documentType, documentName, filePath, uploadedBy]
      );

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async findByRootCardId(rootCardId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT ed.*, u.name as uploaded_by_name 
        FROM engineering_documents ed
        LEFT JOIN users u ON ed.uploaded_by = u.id
        WHERE ed.sales_order_id = ?
        ORDER BY ed.created_at DESC`,
        [rootCardId]
      );
      return (rows || []).map(row => ({
        id: row.id,
        rootCardId: row.sales_order_id,
        documentType: row.document_type,
        documentName: row.document_name,
        filePath: row.file_path,
        uploadedBy: row.uploaded_by,
        uploadedByName: row.uploaded_by_name,
        status: row.status,
        approvalComments: row.approval_comments,
        approvedBy: row.approved_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } finally {
      conn.release();
    }
  }

  static async updateStatus(docId, status, approvalComments = null, approvedBy = null) {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `UPDATE engineering_documents 
        SET status = ?, approval_comments = ?, approved_by = ?
        WHERE id = ?`,
        [status, approvalComments, approvedBy, docId]
      );
    } finally {
      conn.release();
    }
  }

  static async findById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT ed.*, u.name as uploaded_by_name 
        FROM engineering_documents ed
        LEFT JOIN users u ON ed.uploaded_by = u.id
        WHERE ed.id = ?`,
        [id]
      );
      if (!rows[0]) return null;
      const row = rows[0];
      return {
        id: row.id,
        rootCardId: row.sales_order_id,
        documentType: row.document_type,
        documentName: row.document_name,
        filePath: row.file_path,
        uploadedBy: row.uploaded_by,
        uploadedByName: row.uploaded_by_name,
        status: row.status,
        approvalComments: row.approval_comments,
        approvedBy: row.approved_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } finally {
      conn.release();
    }
  }

  static async getByDocumentType(rootCardId, documentType) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT * FROM engineering_documents 
        WHERE sales_order_id = ? AND document_type = ?
        ORDER BY version DESC`,
        [rootCardId, documentType]
      );
      return (rows || []).map(row => ({
        id: row.id,
        rootCardId: row.sales_order_id,
        documentType: row.document_type,
        documentName: row.document_name,
        filePath: row.file_path,
        uploadedBy: row.uploaded_by,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } finally {
      conn.release();
    }
  }
}

module.exports = EngineeringDocument;
