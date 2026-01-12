const pool = require('../config/database');

class OutsourcingTask {
  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO outsourcing_tasks 
       (production_plan_stage_id, production_plan_id, project_id, root_card_id, 
        product_name, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.productionPlanStageId,
        data.productionPlanId,
        data.projectId || null,
        data.rootCardId || null,
        data.productName || null,
        'pending',
        data.createdBy || null
      ]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ot.*, 
              rc.title as root_card_title,
              p.name as project_name,
              pps.stage_name,
              pp.plan_name,
              v.name as vendor_name
       FROM outsourcing_tasks ot
       LEFT JOIN root_cards rc ON ot.root_card_id = rc.id
       LEFT JOIN projects p ON ot.project_id = p.id
       LEFT JOIN production_plan_stages pps ON ot.production_plan_stage_id = pps.id
       LEFT JOIN production_plans pp ON ot.production_plan_id = pp.id
       LEFT JOIN vendors v ON ot.selected_vendor_id = v.id
       WHERE ot.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByProductionPlanStageId(stageId) {
    const [rows] = await pool.execute(
      `SELECT ot.*, 
              rc.title as root_card_title,
              v.name as vendor_name
       FROM outsourcing_tasks ot
       LEFT JOIN root_cards rc ON ot.root_card_id = rc.id
       LEFT JOIN vendors v ON ot.selected_vendor_id = v.id
       WHERE ot.production_plan_stage_id = ?`,
      [stageId]
    );
    return rows[0] || null;
  }

  static async findByProductionPlanId(planId) {
    const [rows] = await pool.execute(
      `SELECT ot.*, 
              rc.title as root_card_title,
              pps.stage_name,
              v.name as vendor_name
       FROM outsourcing_tasks ot
       LEFT JOIN root_cards rc ON ot.root_card_id = rc.id
       LEFT JOIN production_plan_stages pps ON ot.production_plan_stage_id = pps.id
       LEFT JOIN vendors v ON ot.selected_vendor_id = v.id
       WHERE ot.production_plan_id = ?
       ORDER BY ot.created_at DESC`,
      [planId]
    );
    return rows || [];
  }

  static async findAll(filters = {}) {
    let query = `SELECT ot.*, 
                        rc.title as root_card_title,
                        p.name as project_name,
                        pps.stage_name,
                        v.name as vendor_name
                 FROM outsourcing_tasks ot
                 LEFT JOIN root_cards rc ON ot.root_card_id = rc.id
                 LEFT JOIN projects p ON ot.project_id = p.id
                 LEFT JOIN production_plan_stages pps ON ot.production_plan_stage_id = pps.id
                 LEFT JOIN vendors v ON ot.selected_vendor_id = v.id
                 WHERE 1=1`;
    const params = [];

    if (filters.status) {
      query += ' AND ot.status = ?';
      params.push(filters.status);
    }

    if (filters.vendorId) {
      query += ' AND ot.selected_vendor_id = ?';
      params.push(filters.vendorId);
    }

    if (filters.productionPlanId) {
      query += ' AND ot.production_plan_id = ?';
      params.push(filters.productionPlanId);
    }

    query += ' ORDER BY ot.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE outsourcing_tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
  }

  static async selectVendor(taskId, vendorId) {
    await pool.execute(
      'UPDATE outsourcing_tasks SET selected_vendor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [vendorId, taskId]
    );
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    if (data.productName !== undefined) {
      updates.push('product_name = ?');
      params.push(data.productName);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (data.selectedVendorId !== undefined) {
      updates.push('selected_vendor_id = ?');
      params.push(data.selectedVendorId);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.execute(
      `UPDATE outsourcing_tasks SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM outsourcing_tasks WHERE id = ?', [id]);
  }
}

module.exports = OutsourcingTask;
