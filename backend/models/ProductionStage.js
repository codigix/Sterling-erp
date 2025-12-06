const pool = require('../config/database');

class ProductionStage {
  static async create(data, connection = null) {
    const conn = connection || (await pool.getConnection());
    
    try {
      const [result] = await conn.execute(
        `INSERT INTO production_stages 
         (production_plan_id, stage_sequence, stage_name, stage_type, execution_type, 
          assigned_employee_id, assigned_vendor_id, planned_start_date, planned_end_date, 
          estimated_duration_days, delay_tolerance_days, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.productionPlanId,
          data.stageSequence,
          data.stageName,
          data.stageType || 'manufacturing',
          data.executionType || 'in-house',
          data.assignedEmployeeId || null,
          data.assignedVendorId || null,
          data.plannedStartDate || null,
          data.plannedEndDate || null,
          data.estimatedDurationDays || null,
          data.delayToleranceDays || null,
          data.status || 'pending',
          data.notes || null
        ]
      );

      if (!connection) {
        conn.release();
      }

      return result.insertId;
    } catch (error) {
      if (!connection) {
        conn.release();
      }
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ps.*, 
              u.username as assigned_employee_name,
              v.name as assigned_vendor_name,
              pp.plan_name,
              so.customer
       FROM production_stages ps
       LEFT JOIN users u ON u.id = ps.assigned_employee_id
       LEFT JOIN vendors v ON v.id = ps.assigned_vendor_id
       LEFT JOIN production_plans pp ON pp.id = ps.production_plan_id
       LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
       WHERE ps.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByProductionPlan(productionPlanId) {
    const [rows] = await pool.execute(
      `SELECT ps.*, 
              u.username as assigned_employee_name,
              v.name as assigned_vendor_name
       FROM production_stages ps
       LEFT JOIN users u ON u.id = ps.assigned_employee_id
       LEFT JOIN vendors v ON v.id = ps.assigned_vendor_id
       WHERE ps.production_plan_id = ?
       ORDER BY ps.stage_sequence ASC`,
      [productionPlanId]
    );
    return rows || [];
  }

  static async findAll(filters = {}) {
    let query = `SELECT ps.*, 
                        u.username as assigned_employee_name,
                        v.name as assigned_vendor_name,
                        pp.plan_name,
                        so.customer
                 FROM production_stages ps
                 LEFT JOIN users u ON u.id = ps.assigned_employee_id
                 LEFT JOIN vendors v ON v.id = ps.assigned_vendor_id
                 LEFT JOIN production_plans pp ON pp.id = ps.production_plan_id
                 LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
                 WHERE 1=1`;
    const params = [];

    if (filters.productionPlanId) {
      query += ' AND ps.production_plan_id = ?';
      params.push(filters.productionPlanId);
    }

    if (filters.status && filters.status !== 'all') {
      query += ' AND ps.status = ?';
      params.push(filters.status);
    }

    if (filters.executionType) {
      query += ' AND ps.execution_type = ?';
      params.push(filters.executionType);
    }

    if (filters.assignedEmployeeId) {
      query += ' AND ps.assigned_employee_id = ?';
      params.push(filters.assignedEmployeeId);
    }

    query += ' ORDER BY ps.production_plan_id, ps.stage_sequence ASC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    if (data.stageName !== undefined) {
      updates.push('stage_name = ?');
      params.push(data.stageName);
    }
    if (data.stageType !== undefined) {
      updates.push('stage_type = ?');
      params.push(data.stageType);
    }
    if (data.executionType !== undefined) {
      updates.push('execution_type = ?');
      params.push(data.executionType);
    }
    if (data.assignedEmployeeId !== undefined) {
      updates.push('assigned_employee_id = ?');
      params.push(data.assignedEmployeeId);
    }
    if (data.assignedVendorId !== undefined) {
      updates.push('assigned_vendor_id = ?');
      params.push(data.assignedVendorId);
    }
    if (data.plannedStartDate !== undefined) {
      updates.push('planned_start_date = ?');
      params.push(data.plannedStartDate);
    }
    if (data.plannedEndDate !== undefined) {
      updates.push('planned_end_date = ?');
      params.push(data.plannedEndDate);
    }
    if (data.estimatedDurationDays !== undefined) {
      updates.push('estimated_duration_days = ?');
      params.push(data.estimatedDurationDays);
    }
    if (data.delayToleranceDays !== undefined) {
      updates.push('delay_tolerance_days = ?');
      params.push(data.delayToleranceDays);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.execute(
      `UPDATE production_stages SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async updateStatus(id, status) {
    const actualStartDate = status === 'in_progress' ? new Date() : null;
    
    if (status === 'in_progress') {
      await pool.execute(
        'UPDATE production_stages SET status = ?, actual_start_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
    } else if (status === 'completed') {
      await pool.execute(
        'UPDATE production_stages SET status = ?, actual_end_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
    } else {
      await pool.execute(
        'UPDATE production_stages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
    }
  }

  static async setOutwardChallan(stageId, challanId) {
    await pool.execute(
      'UPDATE production_stages SET outward_challan_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [challanId, stageId]
    );
  }

  static async setInwardChallan(stageId, challanId) {
    await pool.execute(
      'UPDATE production_stages SET inward_challan_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [challanId, stageId]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM production_stages WHERE id = ?', [id]);
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN execution_type = 'in-house' THEN 1 ELSE 0 END) as in_house,
        SUM(CASE WHEN execution_type = 'outsource' THEN 1 ELSE 0 END) as outsource
      FROM production_stages
    `);
    return rows[0] || {};
  }
}

module.exports = ProductionStage;
