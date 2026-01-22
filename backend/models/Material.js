const pool = require('../config/database');

class Material {
  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      itemCode: row.item_code,
      itemName: row.item_name,
      batch: row.batch,
      specification: row.specification,
      unit: row.unit,
      category: row.category,
      itemGroupId: row.item_group_id,
      valuationRate: row.valuation_rate,
      sellingRate: row.selling_rate,
      noOfCavity: row.no_of_cavity,
      weightPerUnit: row.weight_per_unit,
      weightUom: row.weight_uom,
      drawingNo: row.drawing_no,
      revision: row.revision,
      materialGrade: row.material_grade,
      eanBarcode: row.ean_barcode,
      gstPercent: row.gst_percent,
      quantity: row.quantity,
      reorderLevel: row.reorder_level,
      location: row.location,
      vendorId: row.vendor_id,
      unitCost: row.unit_cost,
      warehouse: row.warehouse,
      rack: row.rack,
      shelf: row.shelf,
      qrCode: row.qr_code,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];

    if (filters.itemCode) {
      query += ' AND item_code LIKE ?';
      params.push(`%${filters.itemCode}%`);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.belowReorderLevel) {
      query += ' AND quantity < reorder_level';
    }

    const [rows] = await pool.execute(query, params);
    return (rows || []).map(Material.formatRow);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE id = ?',
      [id]
    );
    return Material.formatRow(rows[0]);
  }

  static async findByItemCode(itemCode) {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE item_code = ?',
      [itemCode]
    );
    return Material.formatRow(rows[0]);
  }

  static async findByName(itemName) {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE item_name = ?',
      [itemName]
    );
    return Material.formatRow(rows[0]);
  }

  static async create(data) {
    const { 
      itemCode, itemName, batch, specification, unit, category, 
      itemGroupId, valuationRate, sellingRate, noOfCavity, 
      weightPerUnit, weightUom, drawingNo, revision, 
      materialGrade, eanBarcode, gstPercent,
      quantity, reorderLevel, location, vendorId, unitCost,
      rack, shelf, qrCode
    } = data;
    const [result] = await pool.execute(
      `INSERT INTO inventory (
        item_code, item_name, batch, specification, unit, category, 
        item_group_id, valuation_rate, selling_rate, no_of_cavity, 
        weight_per_unit, weight_uom, drawing_no, revision, 
        material_grade, ean_barcode, gst_percent,
        quantity, reorder_level, location, vendor_id, unit_cost,
        rack, shelf, qr_code
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itemCode, 
        itemName, 
        batch || null, 
        specification || null, 
        unit, 
        category || null, 
        itemGroupId || null, 
        valuationRate || 0, 
        sellingRate || 0, 
        noOfCavity || 1, 
        weightPerUnit || 0, 
        weightUom || null, 
        drawingNo || null, 
        revision || null, 
        materialGrade || null, 
        eanBarcode || null, 
        gstPercent || 0,
        quantity || 0, 
        reorderLevel || 0, 
        location || null, 
        vendorId || null, 
        unitCost || 0,
        rack || null,
        shelf || null,
        qrCode || null
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { 
      itemCode, itemName, batch, specification, unit, category, 
      itemGroupId, valuationRate, sellingRate, noOfCavity, 
      weightPerUnit, weightUom, drawingNo, revision, 
      materialGrade, eanBarcode, gstPercent,
      quantity, reorderLevel, location, vendorId, unitCost,
      rack, shelf, qrCode
    } = data;
    
    const updates = [];
    const params = [];
    
    const fieldMap = {
      item_code: itemCode,
      item_name: itemName,
      batch: batch,
      specification: specification,
      unit: unit,
      category: category,
      item_group_id: itemGroupId,
      valuation_rate: valuationRate,
      selling_rate: sellingRate,
      no_of_cavity: noOfCavity,
      weight_per_unit: weightPerUnit,
      weight_uom: weightUom,
      drawing_no: drawingNo,
      revision: revision,
      material_grade: materialGrade,
      ean_barcode: eanBarcode,
      gst_percent: gstPercent,
      quantity: quantity,
      reorder_level: reorderLevel,
      location: location,
      vendor_id: vendorId,
      unit_cost: unitCost,
      rack: rack,
      shelf: shelf,
      qr_code: qrCode
    };

    for (const [column, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        updates.push(`${column} = ?`);
        params.push(value === "" ? null : value);
      }
    }

    if (updates.length === 0) return;

    params.push(id);
    await pool.execute(
      `UPDATE inventory SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM inventory WHERE id = ?', [id]);
  }

  static async updateQuantity(id, quantity) {
    await pool.execute(
      'UPDATE inventory SET quantity = ? WHERE id = ?',
      [quantity, id]
    );
  }

  static async checkReorderLevels() {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE quantity < reorder_level'
    );
    return (rows || []).map(Material.formatRow);
  }
}

module.exports = Material;
