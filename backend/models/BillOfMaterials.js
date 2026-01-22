const pool = require('../config/database');

class BillOfMaterials {
  static async create(data, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        rootCardId,
        bomName,
        createdBy
      } = data;

      const [result] = await conn.query(
        `INSERT INTO bill_of_materials 
        (sales_order_id, bom_number, created_by, status)
        VALUES (?, ?, ?, 'draft')`,
        [rootCardId, bomName, createdBy]
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
        `SELECT bom.*, u.username as created_by_name 
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

  static async findByRootCardId(rootCardId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT bom.*, u.username as created_by_name 
        FROM bill_of_materials bom
        LEFT JOIN users u ON bom.created_by = u.id
        WHERE bom.sales_order_id = ?
        ORDER BY bom.created_at DESC`,
        [rootCardId]
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

  static async delete(bomId, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      await conn.query(
        `DELETE FROM bom_line_items WHERE bom_id = ?`,
        [bomId]
      );
      await conn.query(
        `DELETE FROM bill_of_materials WHERE id = ?`,
        [bomId]
      );
    } finally {
      if (!connection) conn.release();
    }
  }

  static async getAll() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT bom.*, u.username as created_by_name 
        FROM bill_of_materials bom
        LEFT JOIN users u ON bom.created_by = u.id
        ORDER BY bom.created_at DESC`
      );
      return rows || [];
    } catch (error) {
      console.error('Error fetching all BOMs:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async updateLineItem(itemId, data, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const { itemCode, itemDescription, quantity, unit, unitCost, specification, partType } = data;
      await conn.query(
        `UPDATE bom_line_items 
        SET item_code = ?, item_description = ?, quantity = ?, unit = ?, unit_cost = ?, specification = ?, part_type = ?
        WHERE id = ?`,
        [itemCode, itemDescription, quantity, unit, unitCost, specification, partType, itemId]
      );
    } finally {
      if (!connection) conn.release();
    }
  }

  static async deleteLineItem(itemId, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      await conn.query(
        `DELETE FROM bom_line_items WHERE id = ?`,
        [itemId]
      );
    } finally {
      if (!connection) conn.release();
    }
  }
}

module.exports = BillOfMaterials;
