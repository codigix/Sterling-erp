const pool = require('../config/database');
const { parseJsonField, stringifyJsonField, ensureArray } = require('../utils/rootCardHelpers');

class ClientPODetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS client_po_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        po_number VARCHAR(100) NOT NULL,
        po_date DATE NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(100) NOT NULL,
        client_phone VARCHAR(20) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        project_code VARCHAR(100) NOT NULL,
        client_company_name VARCHAR(255),
        client_address TEXT,
        client_gstin VARCHAR(20),
        billing_address TEXT,
        shipping_address TEXT,
        product_details JSON,
        po_value DECIMAL(12,2),
        currency VARCHAR(10) DEFAULT 'INR',
        terms_conditions JSON,
        attachments JSON,
        project_requirements JSON,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        UNIQUE KEY unique_po_number (po_number),
        INDEX idx_sales_order (sales_order_id)
      )
    `);
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM client_po_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async findByRootCardId(rootCardId) {
    return this.findBySalesOrderId(rootCardId);
  }

  static async findByPONumber(poNumber) {
    const [rows] = await pool.execute(
      `SELECT * FROM client_po_details WHERE po_number = ?`,
      [poNumber]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO client_po_details 
       (sales_order_id, po_number, po_date, client_name, client_email, client_phone, 
        project_name, project_code, client_company_name, client_address, client_gstin, 
        billing_address, shipping_address, product_details, po_value, currency, terms_conditions, attachments, 
        project_requirements, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.rootCardId || data.salesOrderId || null,
        data.poNumber || 'TBD',
        data.poDate || new Date().toISOString().split('T')[0],
        data.clientName || 'TBD',
        data.clientEmail || 'TBD',
        data.clientPhone || 'TBD',
        data.projectName || 'TBD',
        data.projectCode || 'AUTO-GEN',
        data.clientCompanyName || null,
        data.clientAddress || null,
        data.clientGSTIN || null,
        data.billingAddress || null,
        data.shippingAddress || null,
        stringifyJsonField(data.productDetails),
        data.poValue || null,
        data.currency || 'INR',
        stringifyJsonField(data.termsConditions),
        stringifyJsonField(ensureArray(data.attachments)),
        stringifyJsonField(data.projectRequirements),
        data.notes || null
      ]
    );
    return result.insertId;
  }

  static async update(rootCardId, data) {
    await pool.execute(
      `UPDATE client_po_details 
       SET po_number = ?, po_date = ?, client_name = ?, client_email = ?, client_phone = ?,
           project_name = ?, project_code = ?, client_company_name = ?, client_address = ?,
           client_gstin = ?, billing_address = ?, shipping_address = ?, product_details = ?, po_value = ?, currency = ?,
           terms_conditions = ?, attachments = ?, project_requirements = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.poNumber || 'TBD',
        data.poDate || new Date().toISOString().split('T')[0],
        data.clientName || 'TBD',
        data.clientEmail || 'TBD',
        data.clientPhone || 'TBD',
        data.projectName || 'TBD',
        data.projectCode || 'AUTO-GEN',
        data.clientCompanyName || null,
        data.clientAddress || null,
        data.clientGSTIN || null,
        data.billingAddress || null,
        data.shippingAddress || null,
        stringifyJsonField(data.productDetails),
        data.poValue || null,
        data.currency || 'INR',
        stringifyJsonField(data.termsConditions),
        stringifyJsonField(ensureArray(data.attachments)),
        stringifyJsonField(data.projectRequirements),
        data.notes || null,
        rootCardId
      ]
    );
  }

  static async delete(rootCardId) {
    await pool.execute(
      `DELETE FROM client_po_details WHERE sales_order_id = ?`,
      [rootCardId]
    );
  }

  static async getAll(filters = {}) {
    let query = `SELECT * FROM client_po_details`;
    const params = [];

    if (filters.poNumber) {
      query += ` WHERE po_number LIKE ?`;
      params.push(`%${filters.poNumber}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.execute(query, params);
    return rows.map(this.formatRow);
  }

  static async updateClientInfo(rootCardId, data) {
    await pool.execute(
      `UPDATE client_po_details 
       SET po_number = ?, po_date = ?, client_name = ?, client_email = ?, client_phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.poNumber,
        data.poDate,
        data.clientName,
        data.clientEmail,
        data.clientPhone,
        rootCardId
      ]
    );
  }

  static async updateProjectDetails(rootCardId, data) {
    await pool.execute(
      `UPDATE client_po_details 
       SET project_name = ?, project_code = ?, billing_address = ?, shipping_address = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.projectName,
        data.projectCode,
        data.billingAddress,
        data.shippingAddress,
        rootCardId
      ]
    );
  }

  static async updateProjectRequirements(rootCardId, data) {
    await pool.execute(
      `UPDATE client_po_details 
       SET project_requirements = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        stringifyJsonField(data),
        rootCardId
      ]
    );
  }

  static async updateProductDetails(rootCardId, data) {
    await pool.execute(
      `UPDATE client_po_details 
       SET product_details = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        stringifyJsonField(data),
        rootCardId
      ]
    );
  }

  static async getClientInfo(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT po_number, po_date, client_name, client_email, client_phone FROM client_po_details WHERE sales_order_id = ?`,
      [rootCardId]
    );
    return rows[0] ? {
      poNumber: rows[0].po_number,
      poDate: rows[0].po_date,
      clientName: rows[0].client_name,
      clientEmail: rows[0].client_email,
      clientPhone: rows[0].client_phone
    } : null;
  }

  static async getProjectDetails(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT project_name, project_code, billing_address, shipping_address FROM client_po_details WHERE sales_order_id = ?`,
      [rootCardId]
    );
    return rows[0] ? {
      projectName: rows[0].project_name,
      projectCode: rows[0].project_code,
      billingAddress: rows[0].billing_address,
      shippingAddress: rows[0].shipping_address
    } : null;
  }

  static async deleteProjectDetails(rootCardId) {
    await pool.execute(
      `UPDATE client_po_details 
       SET project_name = NULL, project_code = NULL, billing_address = NULL, shipping_address = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [rootCardId]
    );
  }

  static async getProjectRequirements(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT project_requirements FROM client_po_details WHERE sales_order_id = ?`,
      [rootCardId]
    );
    return rows[0] ? parseJsonField(rows[0].project_requirements) : null;
  }

  static async getProductDetails(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT product_details FROM client_po_details WHERE sales_order_id = ?`,
      [rootCardId]
    );
    return rows[0] ? parseJsonField(rows[0].product_details) : null;
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      rootCardId: row.sales_order_id,
      poNumber: row.po_number,
      poDate: row.po_date,
      clientName: row.client_name,
      clientEmail: row.client_email,
      clientPhone: row.client_phone,
      projectName: row.project_name,
      projectCode: row.project_code,
      clientCompanyName: row.client_company_name,
      clientAddress: row.client_address,
      clientGSTIN: row.client_gstin,
      billingAddress: row.billing_address,
      shippingAddress: row.shipping_address,
      productDetails: parseJsonField(row.product_details),
      poValue: row.po_value,
      currency: row.currency,
      termsConditions: parseJsonField(row.terms_conditions),
      attachments: ensureArray(parseJsonField(row.attachments, [])),
      projectRequirements: parseJsonField(row.project_requirements),
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = ClientPODetail;
