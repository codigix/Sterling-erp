const pool = require('../config/database');
const { parseJsonField, stringifyJsonField } = require('../utils/salesOrderHelpers');

class SalesOrderDetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sales_order_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        client_email VARCHAR(100),
        client_phone VARCHAR(20),
        estimated_end_date DATE,
        billing_address TEXT,
        shipping_address TEXT,
        product_details JSON,
        quality_compliance JSON,
        warranty_support JSON,
        payment_terms TEXT,
        project_priority VARCHAR(50),
        total_amount DECIMAL(12,2),
        project_code VARCHAR(100),
        internal_info JSON,
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id)
      )
    `);
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO sales_order_details 
       (sales_order_id, client_email, client_phone, estimated_end_date, billing_address, 
        shipping_address, product_details, quality_compliance, warranty_support, 
        payment_terms, project_priority, total_amount, project_code, internal_info, 
        special_instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.salesOrderId,
        data.clientEmail || null,
        data.clientPhone || null,
        data.estimatedEndDate || null,
        data.billingAddress || null,
        data.shippingAddress || null,
        stringifyJsonField(data.productDetails),
        stringifyJsonField(data.qualityCompliance),
        stringifyJsonField(data.warrantySupport),
        data.paymentTerms || null,
        data.projectPriority || null,
        data.totalAmount || null,
        data.projectCode || null,
        stringifyJsonField(data.internalInfo),
        data.specialInstructions || null
      ]
    );
    return result.insertId;
  }

  static async update(salesOrderId, data) {
    await pool.execute(
      `UPDATE sales_order_details 
       SET client_email = ?, client_phone = ?, estimated_end_date = ?, billing_address = ?, 
           shipping_address = ?, product_details = ?, quality_compliance = ?, warranty_support = ?, 
           payment_terms = ?, project_priority = ?, total_amount = ?, project_code = ?, 
           internal_info = ?, special_instructions = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.clientEmail || null,
        data.clientPhone || null,
        data.estimatedEndDate || null,
        data.billingAddress || null,
        data.shippingAddress || null,
        stringifyJsonField(data.productDetails),
        stringifyJsonField(data.qualityCompliance),
        stringifyJsonField(data.warrantySupport),
        data.paymentTerms || null,
        data.projectPriority || null,
        data.totalAmount || null,
        data.projectCode || null,
        stringifyJsonField(data.internalInfo),
        data.specialInstructions || null,
        salesOrderId
      ]
    );
  }

  static async delete(salesOrderId) {
    await pool.execute(
      `DELETE FROM sales_order_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
  }

  static async updateSalesAndProduct(salesOrderId, data) {
    await pool.execute(
      `UPDATE sales_order_details 
       SET client_email = ?, client_phone = ?, estimated_end_date = ?, billing_address = ?, 
           shipping_address = ?, product_details = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.clientEmail || null,
        data.clientPhone || null,
        data.estimatedEndDate || null,
        data.billingAddress || null,
        data.shippingAddress || null,
        stringifyJsonField(data.productDetails),
        salesOrderId
      ]
    );
  }

  static async updateQualityAndCompliance(salesOrderId, data) {
    await pool.execute(
      `UPDATE sales_order_details 
       SET quality_compliance = ?, warranty_support = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        stringifyJsonField(data.qualityCompliance),
        stringifyJsonField(data.warrantySupport),
        salesOrderId
      ]
    );
  }

  static async updatePaymentAndInternal(salesOrderId, data) {
    await pool.execute(
      `UPDATE sales_order_details 
       SET payment_terms = ?, project_priority = ?, total_amount = ?, project_code = ?, 
           internal_info = ?, special_instructions = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [
        data.paymentTerms || null,
        data.projectPriority || null,
        data.totalAmount || null,
        data.projectCode || null,
        stringifyJsonField(data.internalInfo),
        data.specialInstructions || null,
        salesOrderId
      ]
    );
  }

  static async getSalesAndProduct(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT client_email, client_phone, estimated_end_date, billing_address, shipping_address, product_details 
       FROM sales_order_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? {
      clientEmail: rows[0].client_email,
      clientPhone: rows[0].client_phone,
      estimatedEndDate: rows[0].estimated_end_date,
      billingAddress: rows[0].billing_address,
      shippingAddress: rows[0].shipping_address,
      productDetails: parseJsonField(rows[0].product_details)
    } : null;
  }

  static async getQualityAndCompliance(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT quality_compliance, warranty_support FROM sales_order_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? {
      qualityCompliance: parseJsonField(rows[0].quality_compliance),
      warrantySupport: parseJsonField(rows[0].warranty_support)
    } : null;
  }

  static async getPaymentAndInternal(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT payment_terms, project_priority, total_amount, project_code, internal_info, special_instructions 
       FROM sales_order_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? {
      paymentTerms: rows[0].payment_terms,
      projectPriority: rows[0].project_priority,
      totalAmount: rows[0].total_amount,
      projectCode: rows[0].project_code,
      internalInfo: parseJsonField(rows[0].internal_info),
      specialInstructions: rows[0].special_instructions
    } : null;
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      salesOrderId: row.sales_order_id,
      clientEmail: row.client_email,
      clientPhone: row.client_phone,
      estimatedEndDate: row.estimated_end_date,
      billingAddress: row.billing_address,
      shippingAddress: row.shipping_address,
      productDetails: parseJsonField(row.product_details),
      qualityCompliance: parseJsonField(row.quality_compliance),
      warrantySupport: parseJsonField(row.warranty_support),
      paymentTerms: row.payment_terms,
      projectPriority: row.project_priority,
      totalAmount: row.total_amount,
      projectCode: row.project_code,
      internalInfo: parseJsonField(row.internal_info),
      specialInstructions: row.special_instructions,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = SalesOrderDetail;
