const pool = require('../config/database');
const { parseJsonField, stringifyJsonField, ensureArray } = require('../utils/rootCardHelpers');

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

  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT mrd.*, so.project_name, so.po_number, so.customer 
       FROM material_requirements_details mrd
       JOIN sales_orders so ON mrd.sales_order_id = so.id
       ORDER BY mrd.updated_at DESC`
    );
    return rows.map(row => ({
      ...this.formatRow(row),
      projectName: row.project_name,
      poNumber: row.po_number,
      customer: row.customer
    }));
  }

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT * FROM material_requirements_details WHERE sales_order_id = ?`,
      [rootCardId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static normalizeProcurementStatus(status) {
    const validStatuses = ['pending', 'ordered', 'received', 'partial'];
    const normalized = (status || '').toLowerCase();
    
    if (validStatuses.includes(normalized)) return normalized;
    
    // Map common frontend/workflow statuses to valid procurement ENUM values
    if (normalized === 'in_progress') return 'pending';
    if (normalized === 'completed') return 'received';
    
    return 'pending'; // Default fallback
  }

  static async create(data) {
    const rootCardId = data.rootCardId || data.salesOrderId || data.sales_order_id;
    
    // Safety check: if record already exists, update it instead
    if (rootCardId) {
      const existing = await this.findByRootCardId(rootCardId);
      if (existing) {
        console.log(`[MaterialRequirementsDetail] Record already exists for ID ${rootCardId}. Redirecting to update.`);
        return this.update(rootCardId, data);
      }
    }

    const params = [
      rootCardId || null,
      stringifyJsonField(ensureArray(data.materials)) || '[]',
      data.totalMaterialCost || 0,
      this.normalizeProcurementStatus(data.procurementStatus),
      data.notes || null,
      stringifyJsonField(data.materialDetailsTable || {})
    ];

    const [result] = await pool.execute(
      `INSERT INTO material_requirements_details 
       (sales_order_id, materials, total_material_cost, procurement_status, notes, material_details_table)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [...params]
    );
    return result.insertId;
  }

  static async update(rootCardId, data) {
    const params = [
      stringifyJsonField(ensureArray(data.materials)) || '[]',
      data.totalMaterialCost || 0,
      this.normalizeProcurementStatus(data.procurementStatus),
      data.notes || null,
      stringifyJsonField(data.materialDetailsTable || {}),
      rootCardId
    ];

    await pool.execute(
      `UPDATE material_requirements_details 
       SET materials = ?, total_material_cost = ?, procurement_status = ?, notes = ?, material_details_table = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      params
    );
  }

  static async updateProcurementStatus(rootCardId, status) {
    await pool.execute(
      `UPDATE material_requirements_details 
       SET procurement_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ?`,
      [this.normalizeProcurementStatus(status), rootCardId]
    );
  }

  static async addMaterial(rootCardId, materialData) {
    const [existing] = await pool.execute(
      `SELECT materials FROM material_requirements_details WHERE sales_order_id = ?`,
      [rootCardId]
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
      [JSON.stringify(materials), rootCardId]
    );

    return newMaterial;
  }

  static async getMaterials(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT materials FROM material_requirements_details WHERE sales_order_id = ?`,
      [rootCardId]
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

  static async getMaterial(rootCardId, materialId) {
    const materials = await this.getMaterials(rootCardId);
    return materials.find(m => m.id === parseInt(materialId)) || null;
  }

  static async updateMaterial(rootCardId, materialId, materialData) {
    const [existing] = await pool.execute(
      `SELECT materials FROM material_requirements_details WHERE sales_order_id = ?`,
      [rootCardId]
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
      [JSON.stringify(materials), rootCardId]
    );

    return materials.find(m => m.id === parseInt(materialId));
  }

  static async removeMaterial(rootCardId, materialId) {
    const [existing] = await pool.execute(
      `SELECT materials FROM material_requirements_details WHERE sales_order_id = ?`,
      [rootCardId]
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
      [JSON.stringify(materials), rootCardId]
    );

    return true;
  }

  static async assignMaterial(rootCardId, materialId, employeeId) {
    return this.updateMaterial(rootCardId, materialId, { assignee_id: employeeId });
  }

  static async calculateTotalCost(materials) {
    if (!Array.isArray(materials)) return 0;
    let totalCost = 0;
    
    for (const material of materials) {
      if (!material) continue;
      
      const quantity = parseFloat(material.quantity) || 0;
      // Prioritize cost/valuation over selling rate for BOM calculations
      const priceSource = material.valuationRate ?? material.valuation_rate ?? material.unitCost ?? material.unit_cost ?? material.unitPrice ?? material.sellingRate ?? material.selling_rate ?? 0;
      const price = parseFloat(priceSource) || 0;
      
      totalCost += (quantity * price);
    }
    
    return totalCost;
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      rootCardId: row.sales_order_id,
      materials: ensureArray(parseJsonField(row.materials, [])),
      materialDetailsTable: parseJsonField(row.material_details_table, {}),
      totalMaterialCost: row.total_material_cost,
      procurementStatus: row.procurement_status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = MaterialRequirementsDetail;
