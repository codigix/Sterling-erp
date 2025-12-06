const pool = require('../config/database');

class ProductionPhaseTracking {
  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO production_phase_tracking 
       (sales_order_id, phase_detail_id, sub_task_key, phase_name, sub_task_name, step_number, process_type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.salesOrderId, 
        data.phaseDetailId || null, 
        data.subTaskKey, 
        data.phaseName, 
        data.subTaskName, 
        data.stepNumber || null, 
        data.processType || 'inhouse', 
        data.status || 'Not Started'
      ]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM production_phase_tracking WHERE id = ?', [id]);
    return rows[0];
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM production_phase_tracking WHERE sales_order_id = ? ORDER BY step_number ASC', 
      [salesOrderId]
    );
    return rows || [];
  }

  static async updateStatus(id, status, updates = {}) {
    const fields = ['status = ?'];
    const params = [status];
    
    if (updates.startTime) { 
      fields.push('start_time = ?'); 
      params.push(updates.startTime); 
    }
    if (updates.finishTime) { 
      fields.push('finish_time = ?'); 
      params.push(updates.finishTime); 
    }
    if (updates.assignee) { 
      fields.push('assignee = ?'); 
      params.push(updates.assignee); 
    }
    if (updates.outwardChallanNo) { 
      fields.push('outward_challan_no = ?'); 
      params.push(updates.outwardChallanNo); 
    }
    if (updates.inwardChallanNo) { 
      fields.push('inward_challan_no = ?'); 
      params.push(updates.inwardChallanNo); 
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await pool.execute(`UPDATE production_phase_tracking SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM production_phase_tracking WHERE id = ?', [id]);
  }
}

module.exports = ProductionPhaseTracking;
