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
      itemGroupName: row.item_group_name,
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
    let query = `
      SELECT i.*, ig.name as item_group_name,
             COALESCE(SUM(CASE WHEN ? IS NULL THEN ms.quantity WHEN TRIM(LOWER(ms.warehouse_name)) = TRIM(LOWER(?)) THEN ms.quantity ELSE 0 END), 0) as total_stock,
             GROUP_CONCAT(DISTINCT CASE WHEN ms.quantity > 0 THEN ms.warehouse_name END) as warehouses_list
      FROM inventory i 
      LEFT JOIN item_groups ig ON i.item_group_id = ig.id 
      LEFT JOIN material_stock ms ON i.id = ms.material_id
      WHERE 1=1
    `;
    const params = [filters.warehouse || null, filters.warehouse || null];

    if (filters.itemCode) {
      query += ' AND i.item_code LIKE ?';
      params.push(`%${filters.itemCode}%`);
    }

    if (filters.itemName) {
      query += ' AND i.item_name LIKE ?';
      params.push(`%${filters.itemName}%`);
    }

    if (filters.category) {
      query += ' AND i.category = ?';
      params.push(filters.category);
    }

    query += ' GROUP BY i.id';

    if (filters.onlyWithStock) {
      query += ' HAVING total_stock > 0';
    }

    if (filters.belowReorderLevel) {
      if (filters.onlyWithStock) {
        query += ' AND total_stock < i.reorder_level';
      } else {
        query += ' HAVING total_stock < i.reorder_level';
      }
    }

    const [rows] = await pool.execute(query, params);
    return (rows || []).map(row => {
      const formatted = Material.formatRow(row);
      formatted.total_stock = row.total_stock;
      formatted.available_in_warehouses = row.warehouses_list;
      formatted.quantity = row.total_stock; // For backward compatibility
      return formatted;
    });
  }

  static async updateStock(materialId, warehouse, quantity, batchNo = null) {
    // Add quantity to material_stock (can be negative for issues)
    await pool.execute(`
      INSERT INTO material_stock (material_id, warehouse_name, quantity, batch_no)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `, [materialId, warehouse, quantity, batchNo]);

    // Update main inventory table's quantity and warehouse for backward compatibility
    await pool.execute(`
      UPDATE inventory i
      SET i.quantity = (SELECT COALESCE(SUM(quantity), 0) FROM material_stock WHERE material_id = ?),
          i.warehouse = ?
      WHERE i.id = ?
    `, [materialId, warehouse, materialId]);
  }

  static async getStockByWarehouse(materialId) {
    const [rows] = await pool.execute(
      'SELECT warehouse_name, quantity, batch_no FROM material_stock WHERE material_id = ?',
      [materialId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT i.*, ig.name as item_group_name,
              COALESCE((SELECT SUM(quantity) FROM material_stock WHERE material_id = i.id), 0) as total_stock
       FROM inventory i 
       LEFT JOIN item_groups ig ON i.item_group_id = ig.id 
       WHERE i.id = ?`,
      [id]
    );
    if (!rows[0]) return null;
    const formatted = Material.formatRow(rows[0]);
    formatted.quantity = rows[0].total_stock;
    return formatted;
  }

  static async findByItemCode(itemCode) {
    const [rows] = await pool.execute(
      `SELECT i.*, ig.name as item_group_name,
              COALESCE((SELECT SUM(quantity) FROM material_stock WHERE material_id = i.id), 0) as total_stock
       FROM inventory i 
       LEFT JOIN item_groups ig ON i.item_group_id = ig.id 
       WHERE TRIM(LOWER(i.item_code)) = TRIM(LOWER(?))`,
      [itemCode]
    );
    if (!rows[0]) return null;
    const formatted = Material.formatRow(rows[0]);
    formatted.quantity = rows[0].total_stock;
    return formatted;
  }

  static async findByName(itemName) {
    const [rows] = await pool.execute(
      `SELECT i.*, ig.name as item_group_name,
              COALESCE((SELECT SUM(quantity) FROM material_stock WHERE material_id = i.id), 0) as total_stock
       FROM inventory i 
       LEFT JOIN item_groups ig ON i.item_group_id = ig.id 
       WHERE TRIM(LOWER(i.item_name)) = TRIM(LOWER(?))`,
      [itemName]
    );
    if (!rows[0]) return null;
    const formatted = Material.formatRow(rows[0]);
    formatted.quantity = rows[0].total_stock;
    return formatted;
  }

  static async create(data) {
    const { 
      itemCode, itemName, batch, specification, unit, category, 
      itemGroupId, valuationRate, sellingRate, noOfCavity, 
      weightPerUnit, weightUom, drawingNo, revision, 
      materialGrade, eanBarcode, gstPercent,
      quantity, reorderLevel, location, vendorId, unitCost,
      rack, shelf, qrCode, warehouse
    } = data;
    const [result] = await pool.execute(
      `INSERT INTO inventory (
        item_code, item_name, batch, specification, unit, category, 
        item_group_id, valuation_rate, selling_rate, no_of_cavity, 
        weight_per_unit, weight_uom, drawing_no, revision, 
        material_grade, ean_barcode, gst_percent,
        quantity, reorder_level, location, vendor_id, unit_cost,
        rack, shelf, qr_code, warehouse
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itemCode || `MAT-${Date.now()}-${Math.floor(Math.random()*1000)}`, 
        itemName || "Unnamed Item", 
        batch || null, 
        specification || null, 
        unit || "units", 
        category || "Uncategorized", 
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
        qrCode || null,
        warehouse || null
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
      `SELECT i.*, ig.name as item_group_name 
       FROM inventory i 
       LEFT JOIN item_groups ig ON i.item_group_id = ig.id 
       WHERE i.quantity < i.reorder_level`
    );
    return (rows || []).map(Material.formatRow);
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN quantity < reorder_level THEN 1 ELSE 0 END) as low_stock_count,
        SUM(quantity * unit_cost) as total_value
      FROM inventory
    `);
    
    // Also get recent movements (simulated from stock entries if table exists)
    // For now just return the main stats
    return rows[0] || { total_items: 0, low_stock_count: 0, total_value: 0 };
  }
}

module.exports = Material;
