const pool = require('../config/database');
const { parseJsonField, stringifyJsonField } = require('../utils/salesOrderHelpers');

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
        billing_address, shipping_address, po_value, currency, terms_conditions, attachments, 
        project_requirements, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.salesOrderId,
        data.poNumber,
        data.poDate,
        data.clientName,
        data.clientEmail,
        data.clientPhone,
        data.projectName,
        data.projectCode,
        data.clientCompanyName || null,
        data.clientAddress || null,
        data.clientGSTIN || null,
        data.billingAddress || null,
        data.shippingAddress || null,
        data.poValue || null,
        data.currency || 'INR',
        stringifyJsonField(data.termsConditions),
        stringifyJsonField(data.attachments),
        stringifyJsonField(data.projectRequirements),
        data.notes || null
      ]
    );
    return result.insertId;
  }

  static async update(salesOrderId, data) {
    await pool.execute(
      `UPDATE client_po_details 
       SET po_number = ?, po_date = ?, client_name = ?, client_email = ?, client_phone = ?,
           project_name = ?, project_code = ?, client_company_name = ?, client_address = ?,
           client_gstin = ?, billing_address = ?, shipping_address = ?, po_value = ?, currency = ?,
           terms_conditions = ?, attachments = ?, project_requirements = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.poNumber,
        data.poDate,
        data.clientName,
        data.clientEmail,
        data.clientPhone,
        data.projectName,
        data.projectCode,
        data.clientCompanyName || null,
        data.clientAddress || null,
        data.clientGSTIN || null,
        data.billingAddress || null,
        data.shippingAddress || null,
        data.poValue || null,
        data.currency || 'INR',
        stringifyJsonField(data.termsConditions),
        stringifyJsonField(data.attachments),
        stringifyJsonField(data.projectRequirements),
        data.notes || null,
        salesOrderId
      ]
    );
  }

  static async delete(salesOrderId) {
    await pool.execute(
      `DELETE FROM client_po_details WHERE sales_order_id = ?`,
      [salesOrderId]
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

  static async updateClientInfo(salesOrderId, data) {
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
        salesOrderId
      ]
    );
  }

  static async updateProjectDetails(salesOrderId, data) {
    await pool.execute(
      `UPDATE client_po_details 
       SET project_name = ?, project_code = ?, billing_address = ?, shipping_address = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.projectName,
        data.projectCode,
        data.billingAddress,
        data.shippingAddress,
        salesOrderId
      ]
    );
  }

  static async updateProjectRequirements(salesOrderId, data) {
    await pool.execute(
      `UPDATE client_po_details 
       SET project_requirements = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        stringifyJsonField(data),
        salesOrderId
      ]
    );
  }

  static async getClientInfo(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT po_number, po_date, client_name, client_email, client_phone FROM client_po_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? {
      poNumber: rows[0].po_number,
      poDate: rows[0].po_date,
      clientName: rows[0].client_name,
      clientEmail: rows[0].client_email,
      clientPhone: rows[0].client_phone
    } : null;
  }

  static async getProjectDetails(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT project_name, project_code, billing_address, shipping_address FROM client_po_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? {
      projectName: rows[0].project_name,
      projectCode: rows[0].project_code,
      billingAddress: rows[0].billing_address,
      shippingAddress: rows[0].shipping_address
    } : null;
  }

  static async deleteProjectDetails(salesOrderId) {
    await pool.execute(
      `UPDATE client_po_details 
       SET project_name = NULL, project_code = NULL, billing_address = NULL, shipping_address = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [salesOrderId]
    );
  }

  static async getProjectRequirements(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT project_requirements FROM client_po_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? parseJsonField(rows[0].project_requirements) : null;
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      salesOrderId: row.sales_order_id,
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
      poValue: row.po_value,
      currency: row.currency,
      termsConditions: parseJsonField(row.terms_conditions),
      attachments: parseJsonField(row.attachments),
      projectRequirements: parseJsonField(row.project_requirements),
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = ClientPODetail;
