const pool = require('../config/database');
const { parseJsonField, stringifyJsonField } = require('../utils/salesOrderHelpers');

class MaterialRequirementsDetail {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS material_requirements_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL UNIQUE,
        materials JSON NOT NULL,
        total_material_cost DECIMAL(12,2),
        procurement_status ENUM('pending', 'ordered', 'received', 'partial') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        INDEX idx_sales_order (sales_order_id)
      )
    `);
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM material_requirements_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const params = [
      data.salesOrderId,
      stringifyJsonField(data.materials) || JSON.stringify([]),
      data.totalMaterialCost || null,
      data.procurementStatus || 'pending',
      data.notes || null
    ];

    const [result] = await pool.execute(
      `INSERT INTO material_requirements_details 
       (sales_order_id, materials, total_material_cost, procurement_status, notes)
       VALUES (?, ?, ?, ?, ?)`,
      params
    );
    return result.insertId;
  }

  static async update(salesOrderId, data) {
    const params = [
      stringifyJsonField(data.materials) || JSON.stringify([]),
      data.totalMaterialCost || null,
      data.procurementStatus || 'pending',
      data.notes || null,
      salesOrderId
    ];

    await pool.execute(
      `UPDATE material_requirements_details 
       SET materials = ?, total_material_cost = ?, procurement_status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      params
    );
  }

  static async updateProcurementStatus(salesOrderId, status) {
    await pool.execute(
      `UPDATE material_requirements_details 
       SET procurement_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [status, salesOrderId]
    );
  }

  static async addMaterial(salesOrderId, materialData) {
    const [existing] = await pool.execute(
      `SELECT materials FROM material_requirements_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );

    if (existing.length === 0) {
      throw new Error('Material requirements not found');
    }

    let materials = [];
    try {
      materials = JSON.parse(existing[0].materials || '[]');
    } catch (err) {
      materials = [];
    }

    const newMaterial = {
      id: Date.now(),
      ...materialData,
      createdAt: new Date().toISOString()
    };

    materials.push(newMaterial);

    await pool.execute(
      `UPDATE material_requirements_details SET materials = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?`,
      [JSON.stringify(materials), salesOrderId]
    );

    return newMaterial;
  }

  static async getMaterials(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT materials FROM material_requirements_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );

    if (rows.length === 0) {
      return [];
    }

    try {
      return JSON.parse(rows[0].materials || '[]');
    } catch (err) {
      return [];
    }
  }

  static async getMaterial(salesOrderId, materialId) {
    const materials = await this.getMaterials(salesOrderId);
    return materials.find(m => m.id === parseInt(materialId)) || null;
  }

  static async updateMaterial(salesOrderId, materialId, materialData) {
    const [existing] = await pool.execute(
      `SELECT materials FROM material_requirements_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );

    if (existing.length === 0) {
      throw new Error('Material requirements not found');
    }

    let materials = [];
    try {
      materials = JSON.parse(existing[0].materials || '[]');
    } catch (err) {
      materials = [];
    }

    materials = materials.map(m => 
      m.id === parseInt(materialId) 
        ? { ...m, ...materialData, updatedAt: new Date().toISOString() }
        : m
    );

    await pool.execute(
      `UPDATE material_requirements_details SET materials = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?`,
      [JSON.stringify(materials), salesOrderId]
    );

    return materials.find(m => m.id === parseInt(materialId));
  }

  static async removeMaterial(salesOrderId, materialId) {
    const [existing] = await pool.execute(
      `SELECT materials FROM material_requirements_details WHERE sales_order_id = ?`,
      [salesOrderId]
    );

    if (existing.length === 0) {
      throw new Error('Material requirements not found');
    }

    let materials = [];
    try {
      materials = JSON.parse(existing[0].materials || '[]');
    } catch (err) {
      materials = [];
    }

    materials = materials.filter(m => m.id !== parseInt(materialId));

    await pool.execute(
      `UPDATE material_requirements_details SET materials = ?, updated_at = CURRENT_TIMESTAMP WHERE sales_order_id = ?`,
      [JSON.stringify(materials), salesOrderId]
    );

    return true;
  }

  static async assignMaterial(salesOrderId, materialId, employeeId) {
    return this.updateMaterial(salesOrderId, materialId, { assignee_id: employeeId });
  }

  static async calculateTotalCost(materials) {
    return materials.reduce((total, material) => {
      const cost = (material.unitCost || 0) * (material.quantity || 1);
      return total + cost;
    }, 0);
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      salesOrderId: row.sales_order_id,
      materials: parseJsonField(row.materials),
      totalMaterialCost: row.total_material_cost,
      procurementStatus: row.procurement_status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = MaterialRequirementsDetail;
