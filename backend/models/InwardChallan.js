const pool = require('../config/database');

class InwardChallan {
  static async generateChallanNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now() % 10000;
    return `IC-${year}${month}${day}-${String(timestamp).padStart(4, '0')}`;
  }

  static async create(data) {
    const challanNumber = await this.generateChallanNumber();
    
    const [result] = await pool.execute(
      `INSERT INTO inward_challans 
       (outward_challan_id, challan_number, received_date, received_by, 
        inspection_notes, quality_status, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'received')`,
      [
        data.outwardChallanId,
        challanNumber,
        data.receivedDate || null,
        data.receivedBy || null,
        data.inspectionNotes || null,
        data.qualityStatus || 'pending_inspection',
        data.notes || null
      ]
    );

    return {
      id: result.insertId,
      challanNumber
    };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ic.*, 
              oc.challan_number as outward_challan_number,
              v.name as vendor_name,
              ot.product_name,
              rc.title as root_card_title,
              u.username as received_by_name
       FROM inward_challans ic
       LEFT JOIN outward_challans oc ON ic.outward_challan_id = oc.id
       LEFT JOIN vendors v ON oc.vendor_id = v.id
       LEFT JOIN outsourcing_tasks ot ON oc.outsourcing_task_id = ot.id
       LEFT JOIN root_cards rc ON ot.root_card_id = rc.id
       LEFT JOIN users u ON ic.received_by = u.id
       WHERE ic.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByOutwardChallanId(outwardChallanId) {
    const [rows] = await pool.execute(
      `SELECT ic.*, 
              oc.challan_number as outward_challan_number,
              v.name as vendor_name
       FROM inward_challans ic
       LEFT JOIN outward_challans oc ON ic.outward_challan_id = oc.id
       LEFT JOIN vendors v ON oc.vendor_id = v.id
       WHERE ic.outward_challan_id = ?
       ORDER BY ic.created_at DESC`,
      [outwardChallanId]
    );
    return rows || [];
  }

  static async findAll(filters = {}) {
    let query = `SELECT ic.*, 
                        oc.challan_number as outward_challan_number,
                        v.name as vendor_name,
                        ot.product_name
                 FROM inward_challans ic
                 LEFT JOIN outward_challans oc ON ic.outward_challan_id = oc.id
                 LEFT JOIN vendors v ON oc.vendor_id = v.id
                 LEFT JOIN outsourcing_tasks ot ON oc.outsourcing_task_id = ot.id
                 WHERE 1=1`;
    const params = [];

    if (filters.status) {
      query += ' AND ic.status = ?';
      params.push(filters.status);
    }

    if (filters.qualityStatus) {
      query += ' AND ic.quality_status = ?';
      params.push(filters.qualityStatus);
    }

    query += ' ORDER BY ic.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async addItem(challanId, item) {
    const [result] = await pool.execute(
      `INSERT INTO inward_challan_items 
       (inward_challan_id, outward_challan_item_id, material_id, quantity_received, 
        quantity_expected, unit, quality_status, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        challanId,
        item.outwardChallanItemId || null,
        item.materialId,
        item.quantityReceived,
        item.quantityExpected || null,
        item.unit || 'piece',
        item.qualityStatus || 'pending_inspection',
        item.remarks || null
      ]
    );
    return result.insertId;
  }

  static async getItems(challanId) {
    const [rows] = await pool.execute(
      `SELECT ici.*, 
              inv.item_code,
              inv.item_name,
              inv.unit as default_unit,
              oci.quantity as expected_quantity
       FROM inward_challan_items ici
       LEFT JOIN inventory inv ON ici.material_id = inv.id
       LEFT JOIN outward_challan_items oci ON ici.outward_challan_item_id = oci.id
       WHERE ici.inward_challan_id = ?`,
      [challanId]
    );
    return rows || [];
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE inward_challans SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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

    if (data.receivedDate !== undefined) {
      updates.push('received_date = ?');
      params.push(data.receivedDate);
    }

    if (data.qualityStatus !== undefined) {
      updates.push('quality_status = ?');
      params.push(data.qualityStatus);
    }

    if (data.inspectionNotes !== undefined) {
      updates.push('inspection_notes = ?');
      params.push(data.inspectionNotes);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.execute(
      `UPDATE inward_challans SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async updateItemStatus(itemId, qualityStatus) {
    await pool.execute(
      'UPDATE inward_challan_items SET quality_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [qualityStatus, itemId]
    );
  }

  static async deleteItem(itemId) {
    await pool.execute('DELETE FROM inward_challan_items WHERE id = ?', [itemId]);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM inward_challan_items WHERE inward_challan_id = ?', [id]);
    await pool.execute('DELETE FROM inward_challans WHERE id = ?', [id]);
  }
}

module.exports = InwardChallan;
