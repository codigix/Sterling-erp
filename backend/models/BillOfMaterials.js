const pool = require('../config/database');

class BillOfMaterials {
  static async create(data, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        salesOrderId,
        engineeringDocumentId,
        bomName,
        description,
        createdBy
      } = data;

      const [result] = await conn.query(
        `INSERT INTO bill_of_materials 
        (sales_order_id, engineering_document_id, bom_name, description, created_by, status)
        VALUES (?, ?, ?, ?, ?, 'draft')`,
        [salesOrderId, engineeringDocumentId, bomName, description, createdBy]
      );

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async addLineItem(bomId, lineItem, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        itemCode,
        itemDescription,
        quantity,
        unit,
        unitCost,
        specification,
        partType
      } = lineItem;

      const [result] = await conn.query(
        `INSERT INTO bom_line_items 
        (bom_id, item_code, item_description, quantity, unit, unit_cost, specification, part_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [bomId, itemCode, itemDescription, quantity, unit, unitCost, specification, partType || 'raw_material']
      );

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async findById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT bom.*, u.name as created_by_name 
        FROM bill_of_materials bom
        LEFT JOIN users u ON bom.created_by = u.id
        WHERE bom.id = ?`,
        [id]
      );
      return rows[0];
    } finally {
      conn.release();
    }
  }

  static async getLineItems(bomId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT * FROM bom_line_items WHERE bom_id = ?`,
        [bomId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async findBySalesOrderId(salesOrderId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT bom.*, u.name as created_by_name 
        FROM bill_of_materials bom
        LEFT JOIN users u ON bom.created_by = u.id
        WHERE bom.sales_order_id = ?
        ORDER BY bom.created_at DESC`,
        [salesOrderId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async updateStatus(bomId, status, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      await conn.query(
        `UPDATE bill_of_materials SET status = ? WHERE id = ?`,
        [status, bomId]
      );
    } finally {
      if (!connection) conn.release();
    }
  }
}

module.exports = BillOfMaterials;
