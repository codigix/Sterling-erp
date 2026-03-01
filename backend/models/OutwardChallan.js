const pool = require('../config/database');

class OutwardChallan {
  static async generateChallanNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now() % 10000;
    return `OC-${year}${month}${day}-${String(timestamp).padStart(4, '0')}`;
  }

  static async create(data) {
    const challanNumber = await this.generateChallanNumber();
    
    const [result] = await pool.execute(
      `INSERT INTO outward_challans 
       (outsourcing_task_id, work_order_operation_id, challan_number, vendor_id, material_sent_date, 
        expected_return_date, notes, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'issued')`,
      [
        data.outsourcingTaskId || null,
        data.workOrderOperationId || null,
        challanNumber,
        data.vendorId,
        data.materialSentDate || null,
        data.expectedReturnDate || null,
        data.notes || null,
        data.createdBy || null
      ]
    );

    return {
      id: result.insertId,
      challanNumber
    };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT oc.*, 
              v.name as vendor_name,
              v.email as vendor_email,
              v.contact as vendor_contact,
              ot.product_name,
              rc.title as root_card_title
       FROM outward_challans oc
       LEFT JOIN vendors v ON oc.vendor_id = v.id
       LEFT JOIN outsourcing_tasks ot ON oc.outsourcing_task_id = ot.id
       LEFT JOIN root_cards rc ON ot.root_card_id = rc.id
       WHERE oc.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByOutsourcingTaskId(taskId) {
    const [rows] = await pool.execute(
      `SELECT oc.*, 
              v.name as vendor_name
       FROM outward_challans oc
       LEFT JOIN vendors v ON oc.vendor_id = v.id
       WHERE oc.outsourcing_task_id = ?
       ORDER BY oc.created_at DESC`,
      [taskId]
    );
    return rows || [];
  }

  static async findAll(filters = {}) {
    let query = `SELECT oc.*, 
                        v.name as vendor_name,
                        ot.product_name,
                        ot.production_plan_id
                 FROM outward_challans oc
                 LEFT JOIN vendors v ON oc.vendor_id = v.id
                 LEFT JOIN outsourcing_tasks ot ON oc.outsourcing_task_id = ot.id
                 WHERE 1=1`;
    const params = [];

    if (filters.status) {
      query += ' AND oc.status = ?';
      params.push(filters.status);
    }

    if (filters.vendorId) {
      query += ' AND oc.vendor_id = ?';
      params.push(filters.vendorId);
    }

    query += ' ORDER BY oc.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async addItem(challanId, item) {
    const [result] = await pool.execute(
      `INSERT INTO outward_challan_items 
       (outward_challan_id, material_id, quantity, unit, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [
        challanId,
        item.materialId,
        item.quantity,
        item.unit || 'piece',
        item.remarks || null
      ]
    );
    return result.insertId;
  }

  static async getItems(challanId) {
    const [rows] = await pool.execute(
      `SELECT oci.*, 
              inv.item_code,
              inv.item_name,
              inv.unit as default_unit,
              inv.quantity as current_quantity
       FROM outward_challan_items oci
       LEFT JOIN inventory inv ON oci.material_id = inv.id
       WHERE oci.outward_challan_id = ?`,
      [challanId]
    );
    return rows || [];
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE outward_challans SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (data.materialSentDate !== undefined) {
      updates.push('material_sent_date = ?');
      params.push(data.materialSentDate);
    }

    if (data.expectedReturnDate !== undefined) {
      updates.push('expected_return_date = ?');
      params.push(data.expectedReturnDate);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.execute(
      `UPDATE outward_challans SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async deleteItem(itemId) {
    await pool.execute('DELETE FROM outward_challan_items WHERE id = ?', [itemId]);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM outward_challan_items WHERE outward_challan_id = ?', [id]);
    await pool.execute('DELETE FROM outward_challans WHERE id = ?', [id]);
  }
}

module.exports = OutwardChallan;
