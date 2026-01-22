const pool = require('../config/database');
const { parseJsonField, stringifyJsonField, normalizeStepData, ensureArray } = require('../utils/rootCardHelpers');

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

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT * FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const normalized = normalizeStepData(data, {
      documents: 'designEngineering.attachments.documents',
      drawings3D: 'designEngineering.attachments.drawings',
      designStatus: 'designEngineering.designStatus',
      bomData: 'designEngineering.bomData',
      specifications: 'designEngineering.specifications',
      designNotes: 'designEngineering.designNotes'
    });

    // Fallback to direct keys if designEngineering prefix not present
    if (normalized.documents === undefined) normalized.documents = data.attachments?.documents || data.documents;
    if (normalized.drawings3D === undefined) normalized.drawings3D = data.attachments?.drawings || data.drawings3D;
    if (normalized.designStatus === undefined) normalized.designStatus = data.designStatus || data.generalDesignInfo?.designStatus;
    if (normalized.bomData === undefined) normalized.bomData = data.bomData || data.bomSheet;
    if (normalized.specifications === undefined) normalized.specifications = data.specifications || data.productSpecification;
    if (normalized.designNotes === undefined) normalized.designNotes = data.designNotes || data.commentsNotes?.internalDesignNotes;

    const params = [
      data.rootCardId || data.salesOrderId || data.sales_order_id,
      stringifyJsonField(ensureArray(normalized.documents)),
      normalized.designStatus || 'draft',
      stringifyJsonField(normalized.bomData) || null,
      stringifyJsonField(ensureArray(normalized.drawings3D)),
      stringifyJsonField(normalized.specifications) || null,
      normalized.designNotes || null,
      normalized.reviewedBy || null,
      normalized.approvalComments || null
    ];

    const [result] = await pool.execute(
      `INSERT INTO design_engineering_details 
       (sales_order_id, documents, design_status, bom_data, drawings_3d, specifications, design_notes, reviewed_by, approval_comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );
    return result.insertId;
  }

  static async update(rootCardId, data) {
    const normalized = normalizeStepData(data, {
      documents: 'designEngineering.attachments.documents',
      drawings3D: 'designEngineering.attachments.drawings',
      designStatus: 'designEngineering.designStatus',
      bomData: 'designEngineering.bomData',
      specifications: 'designEngineering.specifications',
      designNotes: 'designEngineering.designNotes'
    });

    // Fallback to direct keys if designEngineering prefix not present
    if (normalized.documents === undefined) normalized.documents = data.attachments?.documents || data.documents;
    if (normalized.drawings3D === undefined) normalized.drawings3D = data.attachments?.drawings || data.drawings3D;
    if (normalized.designStatus === undefined) normalized.designStatus = data.designStatus || data.generalDesignInfo?.designStatus;
    if (normalized.bomData === undefined) normalized.bomData = data.bomData || data.bomSheet;
    if (normalized.specifications === undefined) normalized.specifications = data.specifications || data.productSpecification;
    if (normalized.designNotes === undefined) normalized.designNotes = data.designNotes || data.commentsNotes?.internalDesignNotes;

    const params = [
      stringifyJsonField(ensureArray(normalized.documents)),
      normalized.designStatus || 'draft',
      stringifyJsonField(normalized.bomData) || null,
      stringifyJsonField(ensureArray(normalized.drawings3D)),
      stringifyJsonField(normalized.specifications) || null,
      normalized.designNotes || null,
      normalized.reviewedBy || null,
      normalized.designStatus === 'approved' && !normalized.reviewedAt ? new Date() : (normalized.reviewedAt || null),
      normalized.approvalComments || null,
      rootCardId
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

  static async approveDesign(rootCardId, reviewedBy, comments) {
    await pool.execute(
      `UPDATE design_engineering_details 
       SET design_status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
           approval_comments = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [reviewedBy, comments || null, rootCardId]
    );
  }

  static async rejectDesign(rootCardId, reviewedBy, comments) {
    await pool.execute(
      `UPDATE design_engineering_details 
       SET design_status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
           approval_comments = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [reviewedBy, comments || null, rootCardId]
    );
  }

  static async addDocument(rootCardId, documentData) {
    const [existing] = await pool.execute(
      `SELECT documents FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
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
      [JSON.stringify(documents), rootCardId]
    );

    return newDocument;
  }

  static async getDocuments(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT documents FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
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

  static async getDocument(rootCardId, documentId) {
    const documents = await this.getDocuments(rootCardId);
    return documents.find(doc => doc.id === parseInt(documentId)) || null;
  }

  static async removeDocument(rootCardId, documentId) {
    const [existing] = await pool.execute(
      `SELECT documents FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
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
      [JSON.stringify(documents), rootCardId]
    );

    return true;
  }

  static async getApprovalHistory(rootCardId) {
    const [history] = await pool.execute(
      `SELECT 
        id, sales_order_id, design_status, reviewed_by, reviewed_at, 
        approval_comments, updated_at
      FROM design_engineering_details 
      WHERE sales_order_id = ?`,
      [rootCardId]
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
    const documents = ensureArray(parseJsonField(row.documents, []));
    const drawings3D = ensureArray(parseJsonField(row.drawings_3d, []));
    const bomData = parseJsonField(row.bom_data, []);
    const specifications = parseJsonField(row.specifications, {});

    return {
      id: row.id,
      rootCardId: row.sales_order_id,
      documents,
      drawings3D,
      attachments: {
        drawings: drawings3D,
        documents: documents,
        model3D: "", // Placeholder for compatibility
        fabricationDrawings: "",
        assemblyDrawings: "",
        bomSheet: "",
        calculationSheet: ""
      },
      designStatus: row.design_status,
      bomData,
      specifications,
      designNotes: row.design_notes,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      approvalComments: row.approval_comments,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      
      // Nested structure for frontend compatibility
      generalDesignInfo: {
        designId: row.id,
        designStatus: row.design_status,
        designEngineerName: "", // Need to join with users if needed
        designStartDate: row.created_at,
        designCompletionDate: row.reviewed_at
      },
      productSpecification: specifications,
      commentsNotes: {
        internalDesignNotes: row.design_notes,
        approvalComments: row.approval_comments
      }
    };
  }
}

module.exports = DesignEngineeringDetail;
