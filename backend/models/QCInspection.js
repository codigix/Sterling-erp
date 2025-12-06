const pool = require('../config/database');

class QCInspection {
  static async create(data, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        grnId,
        inspectionType,
        productionStageId,
        inspectorId,
        remarks,
        qrCode,
        batchLabel
      } = data;

      const [result] = await conn.query(
        `INSERT INTO qc_inspections 
        (grn_id, inspection_type, production_stage_id, inspector_id, remarks, qr_code, batch_label, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [grnId, inspectionType, productionStageId, inspectorId, remarks, qrCode, batchLabel]
      );

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async updateStatus(inspectionId, status, remarks = null) {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `UPDATE qc_inspections SET status = ?, remarks = ? WHERE id = ?`,
        [status, remarks, inspectionId]
      );
    } finally {
      conn.release();
    }
  }

  static async findById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT qi.*, u.name as inspector_name, grn.grn_number 
        FROM qc_inspections qi
        LEFT JOIN users u ON qi.inspector_id = u.id
        LEFT JOIN goods_receipt_notes grn ON qi.grn_id = grn.id
        WHERE qi.id = ?`,
        [id]
      );
      return rows[0];
    } finally {
      conn.release();
    }
  }

  static async getPendingInspections() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT qi.*, grn.grn_number, u.name as inspector_name 
        FROM qc_inspections qi
        LEFT JOIN goods_receipt_notes grn ON qi.grn_id = grn.id
        LEFT JOIN users u ON qi.inspector_id = u.id
        WHERE qi.status IN ('pending', 'in_progress')
        ORDER BY qi.created_at DESC`
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async getByProductionStageId(stageId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT qi.*, u.name as inspector_name 
        FROM qc_inspections qi
        LEFT JOIN users u ON qi.inspector_id = u.id
        WHERE qi.production_stage_id = ?
        ORDER BY qi.created_at DESC`,
        [stageId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async getByGRNId(grnId) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT qi.*, u.name as inspector_name 
        FROM qc_inspections qi
        LEFT JOIN users u ON qi.inspector_id = u.id
        WHERE qi.grn_id = ?`,
        [grnId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async getStats() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT 
          COUNT(*) as total_inspections,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial
        FROM qc_inspections`
      );
      return rows[0];
    } finally {
      conn.release();
    }
  }
}

module.exports = QCInspection;
