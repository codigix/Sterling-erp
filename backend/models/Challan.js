const pool = require('../config/database');

class Challan {
  static async create(data, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        challanNumber,
        challanType,
        productionStageId,
        createdBy,
        createdDate,
        fromLocation,
        toLocation,
        vendorId,
        notes
      } = data;

      const [result] = await conn.query(
        `INSERT INTO challans 
        (challan_number, challan_type, production_stage_id, created_by, created_date, 
         from_location, to_location, vendor_id, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [challanNumber, challanType, productionStageId, createdBy, createdDate, 
         fromLocation, toLocation, vendorId, notes]
      );

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async addItem(challanId, item, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        materialId,
        quantity,
        unit,
        batchNumber,
        qrCode,
        remarks
      } = item;

      const [result] = await conn.query(
        `INSERT INTO challan_items 
        (challan_id, material_id, quantity, unit, batch_number, qr_code, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [challanId, materialId, quantity, unit, batchNumber, qrCode, remarks]
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
        `SELECT c.*, u.name as created_by_name, ps.stage_name, v.name as vendor_name
        FROM challans c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN production_stages ps ON c.production_stage_id = ps.id
        LEFT JOIN users v ON c.vendor_id = v.id
        WHERE c.id = ?`,
        [id]
      );
      return rows[0];
    } finally {
      conn.release();
    }
  }

  static async getItems(challanId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT ci.*, i.item_code, i.item_name 
        FROM challan_items ci
        LEFT JOIN inventory i ON ci.material_id = i.id
        WHERE ci.challan_id = ?`,
        [challanId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async updateStatus(challanId, status) {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `UPDATE challans SET status = ? WHERE id = ?`,
        [status, challanId]
      );
    } finally {
      conn.release();
    }
  }

  static async findByProductionStageId(stageId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT c.* FROM challans c
        WHERE c.production_stage_id = ?
        ORDER BY c.created_at DESC`,
        [stageId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async generateChallanNumber() {
    const conn = await pool.getConnection();
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const timestamp = Date.now() % 10000;
      
      return `CH-${year}${month}${day}-${String(timestamp).padStart(4, '0')}`;
    } finally {
      conn.release();
    }
  }
}

module.exports = Challan;
