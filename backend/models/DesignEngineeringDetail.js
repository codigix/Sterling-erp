const pool = require('../config/database');
const { parseJsonField, stringifyJsonField, normalizeStepData, ensureArray } = require('../utils/rootCardHelpers');
const { enrichDocumentWithPath } = require('../utils/filePathRecovery');

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

  static async findByRootCardId(rootCardId) {
    return this.findBySalesOrderId(rootCardId);
  }

  static async create(data) {
    const rootCardId = data.rootCardId || data.salesOrderId || data.sales_order_id;
    
    // Safety check: if record already exists, update it instead
    if (rootCardId) {
      const existing = await this.findByRootCardId(rootCardId);
      if (existing) {
        console.log(`[DesignEngineeringDetail] Record already exists for ID ${rootCardId}. Redirecting to update.`);
        return this.update(rootCardId, data);
      }
    }

    const normalized = normalizeStepData(data, {
      documents: 'designEngineering.attachments.documents',
      drawings3D: 'designEngineering.attachments.drawings',
      designStatus: 'designEngineering.designStatus',
      bomData: 'designEngineering.bomData',
      specifications: 'designEngineering.specifications',
      designNotes: 'designEngineering.designNotes'
    });

    // Fallback to direct keys if designEngineering prefix not present
    if (normalized.documents === undefined) normalized.documents = data.attachments?.documents || data.documents || data.referenceDocuments;
    if (normalized.drawings3D === undefined) normalized.drawings3D = data.attachments?.drawings || data.drawings3D;
    if (normalized.designStatus === undefined) normalized.designStatus = data.designStatus || data.generalDesignInfo?.designStatus;
    if (normalized.bomData === undefined) normalized.bomData = data.bomData || data.bomSheet;
    if (normalized.specifications === undefined) normalized.specifications = data.specifications || data.productSpecification;
    if (normalized.designNotes === undefined) normalized.designNotes = data.designNotes || data.commentsNotes?.internalDesignNotes;

    console.log('[DesignEngineeringDetail.create] Normalized attachments:', {
      documents: normalized.documents ? `${normalized.documents.length} items` : 'empty',
      drawings3D: normalized.drawings3D ? `${normalized.drawings3D.length} items` : 'empty',
      designStatus: normalized.designStatus
    });

    const params = [
      data.rootCardId || data.salesOrderId || data.sales_order_id || null,
      stringifyJsonField(ensureArray(normalized.documents)) || '[]',
      normalized.designStatus || 'draft',
      stringifyJsonField(normalized.bomData) || null,
      stringifyJsonField(ensureArray(normalized.drawings3D)) || '[]',
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
    // Prefer nested attachments if they exist, otherwise use root fields
    const documents = data.attachments?.documents || 
                      data.designEngineering?.attachments?.documents || 
                      data.documents || 
                      data.referenceDocuments || [];
                      
    const drawings3D = data.attachments?.drawings || 
                       data.designEngineering?.attachments?.drawings || 
                       data.drawings3D || [];

    const designStatus = data.designStatus || 
                         data.designEngineering?.designStatus || 
                         data.generalDesignInfo?.designStatus || 'draft';

    const bomData = data.bomData || 
                    data.designEngineering?.bomData || 
                    data.bomSheet || null;

    const specifications = data.specifications || 
                           data.designEngineering?.specifications || 
                           data.productSpecification || null;

    const designNotes = data.designNotes || 
                        data.designEngineering?.designNotes || 
                        data.commentsNotes?.internalDesignNotes || null;

    console.log('[DesignEngineeringDetail.update] Processing attachments for Root Card:', rootCardId, {
      documents: documents ? `${documents.length} items` : 'empty',
      drawings3D: drawings3D ? `${drawings3D.length} items` : 'empty'
    });
    
    if (documents && documents.length > 0) {
      console.log('[DesignEngineeringDetail.update] Sample document:', JSON.stringify(documents[0], null, 2));
      console.log('[DesignEngineeringDetail.update] All documents:', JSON.stringify(documents, null, 2));
    }
    
    if (drawings3D && drawings3D.length > 0) {
      console.log('[DesignEngineeringDetail.update] Sample drawing:', JSON.stringify(drawings3D[0], null, 2));
      console.log('[DesignEngineeringDetail.update] All drawings:', JSON.stringify(drawings3D, null, 2));
    }

    const params = [
      stringifyJsonField(ensureArray(documents)) || '[]',
      designStatus,
      stringifyJsonField(bomData) || null,
      stringifyJsonField(ensureArray(drawings3D)) || '[]',
      stringifyJsonField(specifications) || null,
      designNotes || null,
      data.reviewedBy || null,
      designStatus === 'approved' && !data.reviewedAt ? new Date() : (data.reviewedAt || null),
      data.approvalComments || null,
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

  static async addDocument(rootCardId, documentData, type = 'documents') {
    const column = type === 'drawings' ? 'drawings_3d' : 'documents';
    const [existing] = await pool.execute(
      `SELECT ${column} FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
    );

    if (existing.length === 0) {
      throw new Error('Design engineering details not found');
    }

    let currentItems = [];
    try {
      currentItems = JSON.parse(existing[0][column] || '[]');
    } catch (err) {
      currentItems = [];
    }

    const newItem = {
      id: Date.now(),
      name: documentData.name,
      path: documentData.path,
      size: documentData.size,
      mimeType: documentData.mimeType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: documentData.uploadedBy
    };

    console.log(`[DesignEngineeringDetail.addDocument] Adding ${type} for root card ${rootCardId}`);
    console.log(`[DesignEngineeringDetail.addDocument] Document data:`, JSON.stringify(newItem, null, 2));

    currentItems.push(newItem);

    await pool.execute(
      `UPDATE design_engineering_details SET ${column} = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?`,
      [JSON.stringify(currentItems), rootCardId]
    );

    console.log(`[DesignEngineeringDetail.addDocument] Successfully saved. Total items now: ${currentItems.length}`);

    return newItem;
  }

  static async getDocuments(rootCardId) {
    console.log(`[DesignEngineeringDetail.getDocuments] Fetching for Root Card: ${rootCardId}`);
    const [rows] = await pool.execute(
      `SELECT documents FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
    );

    console.log(`[DesignEngineeringDetail.getDocuments] Rows found: ${rows.length}`);

    if (rows.length === 0) {
      return [];
    }

    try {
      const rawDocsFromDB = rows[0].documents;
      console.log(`[DesignEngineeringDetail.getDocuments] Raw docs from DB type:`, typeof rawDocsFromDB);
      const docs = ensureArray(parseJsonField(rawDocsFromDB, []));
      
      console.log(`[DesignEngineeringDetail.getDocuments] Parsed ${docs.length} documents for root card ${rootCardId}`);
      
      return docs.map((doc, idx) => {
        try {
          const enriched = enrichDocumentWithPath(doc, 'design-engineering');
          
          // Generate a stable ID if missing (critical for approval workflow)
          // We use a simple numeric hash of the path if ID is not present
          let stableId = enriched.id;
          if (!stableId && enriched.path) {
            let hash = 0;
            const str = enriched.path;
            for (let i = 0; i < str.length; i++) {
              hash = ((hash << 5) - hash) + str.charCodeAt(i);
              hash |= 0; 
            }
            stableId = Math.abs(hash) + 1000000; // Offset to avoid collisions with timestamps
          }

          // Normalize field names for frontend compatibility
          const normalized = {
            ...enriched,
            id: stableId || (Date.now() + idx), // Last resort fallback
            name: enriched.name || enriched.fileName || enriched.file_name || 'Unknown',
            mimeType: enriched.mimeType || 'application/octet-stream',
            uploadedAt: enriched.uploadedAt || new Date().toISOString(),
            size: enriched.size || enriched.fileSize || 0,
            format: enriched.format || (enriched.name ? enriched.name.split('.').pop()?.toUpperCase() : 'Unknown')
          };
          return normalized;
        } catch (enrichError) {
          console.error(`[DesignEngineeringDetail.getDocuments] Error enriching doc at index ${idx}:`, enrichError.message);
          return doc;
        }
      });
    } catch (err) {
      console.error('[DesignEngineeringDetail.getDocuments] Error:', err.message);
      return [];
    }
  }

  static async getDocument(rootCardId, documentId) {
    const documents = await this.getDocuments(rootCardId);
    // Use loose equality for ID comparison as it might be string/number mismatch from params
    return documents.find(doc => String(doc.id) === String(documentId)) || null;
  }

  static async getDrawings(rootCardId) {
    console.log(`[DesignEngineeringDetail.getDrawings] Fetching for Root Card: ${rootCardId}`);
    const [rows] = await pool.execute(
      `SELECT drawings_3d FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
    );

    console.log(`[DesignEngineeringDetail.getDrawings] Rows found: ${rows.length}`);

    if (rows.length === 0) {
      return [];
    }

    try {
      const rawDrawingsFromDB = rows[0].drawings_3d;
      console.log(`[DesignEngineeringDetail.getDrawings] Raw drawings from DB type:`, typeof rawDrawingsFromDB);
      const drawings = ensureArray(parseJsonField(rawDrawingsFromDB, []));
      
      console.log(`[DesignEngineeringDetail.getDrawings] Parsed ${drawings.length} drawings for root card ${rootCardId}`);
      
      return drawings.map((drawing, idx) => {
        try {
          const enriched = enrichDocumentWithPath(drawing, 'design-engineering');
          
          // Generate a stable ID if missing (critical for approval workflow)
          let stableId = enriched.id;
          if (!stableId && enriched.path) {
            let hash = 0;
            const str = enriched.path;
            for (let i = 0; i < str.length; i++) {
              hash = ((hash << 5) - hash) + str.charCodeAt(i);
              hash |= 0; 
            }
            stableId = Math.abs(hash) + 2000000; // Use different offset for drawings
          }

          // Normalize field names for frontend compatibility
          const normalized = {
            ...enriched,
            id: stableId || (Date.now() + idx),
            name: enriched.name || enriched.fileName || enriched.file_name || 'Unknown',
            mimeType: enriched.mimeType || 'application/octet-stream',
            uploadedAt: enriched.uploadedAt || new Date().toISOString(),
            size: enriched.size || enriched.fileSize || 0,
            format: enriched.format || (enriched.name ? enriched.name.split('.').pop()?.toUpperCase() : 'Unknown')
          };
          return normalized;
        } catch (enrichError) {
          console.error(`[DesignEngineeringDetail.getDrawings] Error enriching drawing at index ${idx}:`, enrichError.message);
          return drawing;
        }
      });
    } catch (err) {
      console.error('[DesignEngineeringDetail.getDrawings] Error:', err.message);
      return [];
    }
  }

  static async getDrawing(rootCardId, drawingId) {
    const drawings = await this.getDrawings(rootCardId);
    return drawings.find(d => String(d.id) === String(drawingId)) || null;
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

  static async removeDrawing(rootCardId, drawingId) {
    const [existing] = await pool.execute(
      `SELECT drawings_3d FROM design_engineering_details WHERE sales_order_id = ?`,
      [rootCardId]
    );

    if (existing.length === 0) {
      throw new Error('Design engineering details not found');
    }

    let drawings = [];
    try {
      drawings = JSON.parse(existing[0].drawings_3d || '[]');
    } catch (err) {
      drawings = [];
    }

    drawings = drawings.filter(d => d.id !== parseInt(drawingId));

    await pool.execute(
      `UPDATE design_engineering_details SET drawings_3d = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?`,
      [JSON.stringify(drawings), rootCardId]
    );

    return true;
  }

  static async updateDocuments(rootCardId, documents) {
    await pool.execute(
      `UPDATE design_engineering_details SET documents = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?`,
      [JSON.stringify(documents), rootCardId]
    );
  }

  static async updateDrawings(rootCardId, drawings) {
    await pool.execute(
      `UPDATE design_engineering_details SET drawings_3d = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?`,
      [JSON.stringify(drawings), rootCardId]
    );
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
