const pool = require('../config/database');

class ProductionPhaseDetail {
  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO production_phase_details
       (sales_order_id, sub_task_key, phase_name, sub_task_name, process_type, 
        measurements, tolerances, equipment_specifications, assembly_done_by, done_by, 
        motor_done_by, operator_name, painter_name, welder_id, vendor_name, vendor_contact, 
        expected_delivery_date, material_info, specifications, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.salesOrderId, data.subTaskKey, data.phaseName, data.subTaskName, data.processType || 'inhouse',
        data.measurements || null, data.tolerances || null, data.equipmentSpecifications || null,
        data.assemblyDoneBy || null, data.doneBy || null, data.motorDoneBy || null, data.operatorName || null,
        data.painterName || null, data.welderId || null, data.vendorName || null, data.vendorContact || null,
        data.expectedDeliveryDate || null, data.materialInfo ? JSON.stringify(data.materialInfo) : null,
        data.specifications || null, data.notes || null
      ]
    );
    return result.insertId;
  }

  static async findBySubTaskKey(salesOrderId, subTaskKey) {
    const [rows] = await pool.execute(
      'SELECT * FROM production_phase_details WHERE sales_order_id = ? AND sub_task_key = ?',
      [salesOrderId, subTaskKey]
    );
    return rows[0];
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM production_phase_details WHERE sales_order_id = ? ORDER BY created_at DESC',
      [salesOrderId]
    );
    return rows || [];
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM production_phase_details WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, data) {
    const updates = [];
    const params = [];
    
    for (const [key, value] of Object.entries(data)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      updates.push(`${dbKey} = ?`);
      params.push(key === 'materialInfo' ? (value ? JSON.stringify(value) : null) : (value || null));
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await pool.execute(`UPDATE production_phase_details SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM production_phase_details WHERE id = ?', [id]);
  }
}

module.exports = ProductionPhaseDetail;
