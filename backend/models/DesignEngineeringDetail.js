const pool = require('../config/database');
const { parseJsonField, stringifyJsonField } = require('../utils/salesOrderHelpers');

class DesignEngineeringDetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS design_engineering_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        documents JSON NOT NULL,
        design_status ENUM('draft', 'in_review', 'approved', 'rejected') DEFAULT 'draft',
        bom_data JSON,
        drawings_3d JSON,
        specifications JSON,
        design_notes TEXT,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        approval_comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id),
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_design_status (design_status)
      )
    `);
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM design_engineering_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const params = [
      data.salesOrderId,
      stringifyJsonField(data.documents) || JSON.stringify([]),
      data.designStatus || 'draft',
      stringifyJsonField(data.bomData) || null,
      stringifyJsonField(data.drawings3D) || null,
      stringifyJsonField(data.specifications) || null,
      data.designNotes || null,
      data.reviewedBy || null,
      data.approvalComments || null
    ];

    const [result] = await pool.execute(
      `INSERT INTO design_engineering_details 
       (sales_order_id, documents, design_status, bom_data, drawings_3d, specifications, design_notes, reviewed_by, approval_comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );
    return result.insertId;
  }

  static async update(salesOrderId, data) {
    const params = [
      stringifyJsonField(data.documents) || JSON.stringify([]),
      data.designStatus || 'draft',
      stringifyJsonField(data.bomData) || null,
      stringifyJsonField(data.drawings3D) || null,
      stringifyJsonField(data.specifications) || null,
      data.designNotes || null,
      data.reviewedBy || null,
      data.designStatus === 'approved' && !data.reviewedAt ? new Date() : (data.reviewedAt || null),
      data.approvalComments || null,
      salesOrderId
    ];

    await pool.execute(
      `UPDATE design_engineering_details 
       SET documents = ?, design_status = ?, bom_data = ?, drawings_3d = ?, 
           specifications = ?, design_notes = ?, reviewed_by = ?, reviewed_at = ?,
           approval_comments = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      params
    );
  }

  static async approveDesign(salesOrderId, reviewedBy, comments) {
    await pool.execute(
      `UPDATE design_engineering_details 
       SET design_status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
           approval_comments = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [reviewedBy, comments || null, salesOrderId]
    );
  }

  static async rejectDesign(salesOrderId, reviewedBy, comments) {
    await pool.execute(
      `UPDATE design_engineering_details 
       SET design_status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
           approval_comments = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [reviewedBy, comments || null, salesOrderId]
    );
  }

  static async addDocument(salesOrderId, documentData) {
    const [existing] = await pool.execute(
      `SELECT documents FROM design_engineering_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );

    if (existing.length === 0) {
      throw new Error('Design engineering details not found');
    }

    let documents = [];
    try {
      documents = JSON.parse(existing[0].documents || '[]');
    } catch (err) {
      documents = [];
    }

    const newDocument = {
      id: Date.now(),
      name: documentData.name,
      path: documentData.path,
      size: documentData.size,
      mimeType: documentData.mimeType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: documentData.uploadedBy
    };

    documents.push(newDocument);

    await pool.execute(
      `UPDATE design_engineering_details SET documents = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?`,
      [JSON.stringify(documents), salesOrderId]
    );

    return newDocument;
  }

  static async getDocuments(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT documents FROM design_engineering_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );

    if (rows.length === 0) {
      return [];
    }

    try {
      return JSON.parse(rows[0].documents || '[]');
    } catch (err) {
      return [];
    }
  }

  static async getDocument(salesOrderId, documentId) {
    const documents = await this.getDocuments(salesOrderId);
    return documents.find(doc => doc.id === parseInt(documentId)) || null;
  }

  static async removeDocument(salesOrderId, documentId) {
    const [existing] = await pool.execute(
      `SELECT documents FROM design_engineering_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );

    if (existing.length === 0) {
      throw new Error('Design engineering details not found');
    }

    let documents = [];
    try {
      documents = JSON.parse(existing[0].documents || '[]');
    } catch (err) {
      documents = [];
    }

    documents = documents.filter(doc => doc.id !== parseInt(documentId));

    await pool.execute(
      `UPDATE design_engineering_details SET documents = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?`,
      [JSON.stringify(documents), salesOrderId]
    );

    return true;
  }

  static async getApprovalHistory(salesOrderId) {
    const [history] = await pool.execute(
      `SELECT 
        id, sales_order_id, design_status, reviewed_by, reviewed_at, 
        approval_comments, updated_at
      FROM design_engineering_details 
      WHERE sales_order_id = ?`,
      [salesOrderId]
    );

    return history.map(h => ({
      id: h.id,
      status: h.design_status,
      reviewedBy: h.reviewed_by,
      reviewedAt: h.reviewed_at,
      comments: h.approval_comments,
      updatedAt: h.updated_at
    }));
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      salesOrderId: row.sales_order_id,
      documents: parseJsonField(row.documents),
      designStatus: row.design_status,
      bomData: parseJsonField(row.bom_data),
      drawings3D: parseJsonField(row.drawings_3d),
      specifications: parseJsonField(row.specifications),
      designNotes: row.design_notes,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      approvalComments: row.approval_comments,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = DesignEngineeringDetail;
