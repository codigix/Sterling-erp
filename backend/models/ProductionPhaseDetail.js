const pool = require('../config/database');
const { parseJsonField, stringifyJsonField, normalizeStepData, ensureArray } = require('../utils/rootCardHelpers');

class ProductionPhaseDetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS production_phase_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        sub_task_key VARCHAR(100) NOT NULL,
        phase_name VARCHAR(100),
        sub_task_name VARCHAR(100),
        process_type ENUM('inhouse', 'outsource') DEFAULT 'inhouse',
        measurements TEXT,
        tolerances TEXT,
        equipment_specifications TEXT,
        assembly_done_by VARCHAR(255),
        done_by VARCHAR(255),
        motor_done_by VARCHAR(255),
        operator_name VARCHAR(255),
        painter_name VARCHAR(255),
        welder_id VARCHAR(255),
        vendor_name VARCHAR(255),
        vendor_contact VARCHAR(255),
        expected_delivery_date DATE,
        material_info JSON,
        specifications TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id),
        INDEX idx_sub_task (sub_task_key)
      )
    `);
  }

  static async create(data) {
    const normalized = normalizeStepData(data, {});
    
    const [result] = await pool.execute(
      `INSERT INTO production_phase_details
       (sales_order_id, sub_task_key, phase_name, sub_task_name, process_type, 
        measurements, tolerances, equipment_specifications, assembly_done_by, done_by, 
        motor_done_by, operator_name, painter_name, welder_id, vendor_name, vendor_contact, 
        expected_delivery_date, material_info, specifications, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalized.rootCardId, normalized.subTaskKey, normalized.phaseName, normalized.subTaskName, normalized.processType || 'inhouse',
        normalized.measurements || null, normalized.tolerances || null, normalized.equipmentSpecifications || null,
        normalized.assemblyDoneBy || null, normalized.doneBy || null, normalized.motorDoneBy || null, normalized.operatorName || null,
        normalized.painterName || null, normalized.welderId || null, normalized.vendorName || null, normalized.vendorContact || null,
        normalized.expectedDeliveryDate || null, stringifyJsonField(normalized.materialInfo),
        normalized.specifications || null, normalized.notes || null
      ]
    );
    return result.insertId;
  }

  static async findBySubTaskKey(rootCardId, subTaskKey) {
    const [rows] = await pool.execute(
      'SELECT * FROM production_phase_details WHERE sales_order_id = ? AND sub_task_key = ?',
      [rootCardId, subTaskKey]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      'SELECT * FROM production_phase_details WHERE sales_order_id = ? ORDER BY created_at DESC',
      [rootCardId]
    );
    return rows.map(row => this.formatRow(row));
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM production_phase_details WHERE id = ?', [id]);
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async update(id, data) {
    const updates = [];
    const params = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'rootCardId') continue;
      
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      updates.push(`${dbKey} = ?`);
      
      if (key === 'materialInfo') {
        params.push(stringifyJsonField(value));
      } else {
        params.push(value || null);
      }
    }
    
    if (updates.length === 0) return;
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await pool.execute(`UPDATE production_phase_details SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM production_phase_details WHERE id = ?', [id]);
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      rootCardId: row.sales_order_id,
      subTaskKey: row.sub_task_key,
      phaseName: row.phase_name,
      subTaskName: row.sub_task_name,
      processType: row.process_type,
      measurements: row.measurements,
      tolerances: row.tolerances,
      equipmentSpecifications: row.equipment_specifications,
      assemblyDoneBy: row.assembly_done_by,
      doneBy: row.done_by,
      motorDoneBy: row.motor_done_by,
      operatorName: row.operator_name,
      painterName: row.painter_name,
      welderId: row.welder_id,
      vendorName: row.vendor_name,
      vendorContact: row.vendor_contact,
      expectedDeliveryDate: row.expected_delivery_date,
      materialInfo: parseJsonField(row.material_info),
      specifications: row.specifications,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = ProductionPhaseDetail;
