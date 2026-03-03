const pool = require('../config/database');

class ComprehensiveBOM {
  static async create(data, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        productName,
        itemCode,
        customer,
        bomNumber,
        itemGroup,
        quantity,
        uom,
        revision,
        description,
        isActive,
        isDefault,
        projectId,
        rootCardId,
        createdBy,
        status,
        lossPercent
      } = data;

      const [result] = await conn.execute(
        `INSERT INTO bill_of_materials 
        (product_name, item_code, customer, bom_number, item_group, quantity, uom, revision, description, 
         is_active, is_default, project_id, root_card_id, created_by, status, loss_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productName, itemCode, customer || null, bomNumber || null, itemGroup, quantity, uom, revision || 1, 
          description, isActive ? 1 : 0, isDefault ? 1 : 0, 
          projectId || null, rootCardId || null, createdBy, status || 'draft', lossPercent || 0
        ]
      );

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async addComponent(bomId, component, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        componentCode,
        quantity,
        uom,
        rate,
        lossPercent,
        notes
      } = component;

      const [result] = await conn.execute(
        `INSERT INTO bom_components 
        (bom_id, component_code, quantity, uom, rate, loss_percent, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [bomId, componentCode, quantity, uom, rate || 0, lossPercent || 0, notes || null]
      );

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async addMaterial(bomId, material, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        itemCode,
        itemName,
        quantity,
        uom,
        itemGroup,
        rate,
        warehouse,
        operation
      } = material;

      const [result] = await conn.execute(
        `INSERT INTO bom_materials 
        (bom_id, item_code, item_name, quantity, uom, item_group, rate, warehouse, operation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bomId, itemCode || null, itemName, quantity, uom, itemGroup, rate || 0, warehouse || null, operation || null]
      );

      // Update material's primary warehouse in inventory table to persist it globally
      if (itemCode && warehouse) {
        await conn.execute(
          `UPDATE inventory SET location = ?, warehouse = ? WHERE item_code = ?`,
          [warehouse, warehouse, itemCode]
        );
      }

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async addOperation(bomId, operation, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        operationName,
        workstation,
        cycleTime,
        setupTime,
        hourlyRate,
        cost,
        type,
        targetWarehouse
      } = operation;

      const [result] = await conn.execute(
        `INSERT INTO bom_operations 
        (bom_id, operation_name, workstation, cycle_time, setup_time, hourly_rate, cost, type, target_warehouse)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bomId, operationName, workstation || null, cycleTime || 0, setupTime || 0, 
         hourlyRate || 0, cost || 0, type || 'in-house', targetWarehouse || null]
      );

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async addScrapLoss(bomId, scrap, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        itemCode,
        name,
        inputQty,
        lossPercent,
        rate
      } = scrap;

      const [result] = await conn.execute(
        `INSERT INTO bom_scrap_loss 
        (bom_id, item_code, name, input_qty, loss_percent, rate)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [bomId, itemCode, name, inputQty, lossPercent || 0, rate || 0]
      );

      return result.insertId;
    } finally {
      if (!connection) conn.release();
    }
  }

  static async findByProductAndRevision(itemCode, revision) {
    const [rows] = await pool.execute(
      'SELECT id FROM bill_of_materials WHERE item_code = ? AND revision = ?',
      [itemCode, revision]
    );
    return rows[0];
  }

  static async findLatestByItemCode(itemCode) {
    const [rows] = await pool.execute(
      `SELECT id FROM bill_of_materials 
       WHERE item_code = ? 
       ORDER BY CASE WHEN status = 'approved' THEN 1 WHEN status = 'active' THEN 2 ELSE 3 END, 
       revision DESC LIMIT 1`,
      [itemCode]
    );
    return rows[0];
  }

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      'SELECT id FROM bill_of_materials WHERE root_card_id = ? ORDER BY revision DESC LIMIT 1',
      [rootCardId]
    );
    return rows[0];
  }

  static async findAllByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT bom.*, u.username as created_by_name 
       FROM bill_of_materials bom
       LEFT JOIN users u ON bom.created_by = u.id
       WHERE bom.root_card_id = ? 
       ORDER BY bom.revision DESC`,
      [rootCardId]
    );
    return (rows || []).map(row => this.transformBOMRow(row));
  }

  static transformBOMRow(bom) {
    if (!bom) return null;
    return {
      id: bom.id,
      productName: bom.product_name,
      itemCode: bom.item_code,
      customer: bom.customer,
      bomNumber: bom.bom_number,
      itemGroup: bom.item_group,
      quantity: bom.quantity,
      uom: bom.uom,
      revision: bom.revision,
      description: bom.description,
      isActive: bom.is_active === 1,
      isDefault: bom.is_default === 1,
      projectId: bom.project_id,
      rootCardId: bom.root_card_id,
      status: bom.status,
      totalCost: bom.total_cost || 0,
      lossPercent: bom.loss_percent || 0,
      createdBy: bom.created_by,
      createdByName: bom.created_by_name,
      createdAt: bom.created_at,
      updatedAt: bom.updated_at
    };
  }

  static async findById(id) {
    const conn = await pool.getConnection();
    try {
      return await this.fetchBOMRecursive(id, conn);
    } finally {
      conn.release();
    }
  }

  static async fetchBOMRecursive(id, conn) {
    const [rows] = await conn.execute(
      `SELECT bom.*, u.username as created_by_name 
      FROM bill_of_materials bom
      LEFT JOIN users u ON bom.created_by = u.id
      WHERE bom.id = ?`,
      [id]
    );

    if (!rows[0]) return null;

    const bom = this.transformBOMRow(rows[0]);
    const [components] = await conn.execute(
      `SELECT bc.*, i.item_name 
       FROM bom_components bc 
       LEFT JOIN inventory i ON bc.component_code = i.item_code 
       WHERE bc.bom_id = ?`,
      [id]
    );
    const [materials] = await conn.execute(
      'SELECT * FROM bom_materials WHERE bom_id = ?',
      [id]
    );
    const [operations] = await conn.execute(
      'SELECT * FROM bom_operations WHERE bom_id = ?',
      [id]
    );
    const [scrapLoss] = await conn.execute(
      'SELECT * FROM bom_scrap_loss WHERE bom_id = ?',
      [id]
    );

    return {
      ...bom,
      components: await Promise.all((components || []).map(async c => {
        const componentData = {
          id: c.id,
          bomId: c.bom_id,
          componentCode: c.component_code,
          itemName: c.item_name,
          quantity: c.quantity,
          uom: c.uom,
          rate: c.rate,
          lossPercent: c.loss_percent,
          notes: c.notes
        };

        // Check if this component has its own BOM (is a sub-assembly)
        const subBOMRef = await this.findLatestByItemCode(c.component_code);
        if (subBOMRef && subBOMRef.id !== id) { // Prevent infinite recursion
          componentData.subAssemblyDetails = await this.fetchBOMRecursive(subBOMRef.id, conn);
        }

        return componentData;
      })),
      materials: (materials || []).map(m => ({
        id: m.id,
        bomId: m.bom_id,
        itemCode: m.item_code,
        itemName: m.item_name,
        quantity: m.quantity,
        uom: m.uom,
        itemGroup: m.item_group,
        rate: m.rate,
        warehouse: m.warehouse,
        operation: m.operation
      })),
      operations: (operations || []).map(o => ({
        id: o.id,
        bomId: o.bom_id,
        operationName: o.operation_name,
        workstation: o.workstation,
        cycleTime: o.cycle_time,
        setupTime: o.setup_time,
        hourlyRate: o.hourly_rate,
        cost: o.cost,
        type: o.type,
        targetWarehouse: o.target_warehouse
      })),
      scrapLoss: (scrapLoss || []).map(s => ({
        id: s.id,
        bomId: s.bom_id,
        itemCode: s.item_code,
        name: s.name,
        inputQty: s.input_qty,
        lossPercent: s.loss_percent,
        rate: s.rate
      }))
    };
  }

  static async getAll() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT bom.*, u.username as created_by_name 
        FROM bill_of_materials bom
        LEFT JOIN users u ON bom.created_by = u.id
        ORDER BY bom.created_at DESC`
      );
      return (rows || []).map(row => this.transformBOMRow(row));
    } finally {
      conn.release();
    }
  }

  static async getApproved(itemGroup = null) {
    const conn = await pool.getConnection();
    try {
      let query = `SELECT bom.*, u.username as created_by_name 
        FROM bill_of_materials bom
        LEFT JOIN users u ON bom.created_by = u.id
        WHERE bom.status = 'approved'`;
      
      const params = [];
      if (itemGroup) {
        query += ` AND bom.item_group = ?`;
        params.push(itemGroup);
      }
      
      query += ` ORDER BY bom.created_at DESC`;
      
      const [rows] = await conn.execute(query, params);
      return (rows || []).map(row => this.transformBOMRow(row));
    } finally {
      conn.release();
    }
  }

  static async update(id, data, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        productName,
        itemCode,
        customer,
        bomNumber,
        itemGroup,
        quantity,
        uom,
        revision,
        description,
        isActive,
        isDefault,
        projectId,
        rootCardId,
        status,
        lossPercent
      } = data;

      await conn.execute(
        `UPDATE bill_of_materials 
        SET product_name = ?, item_code = ?, customer = ?, bom_number = ?, item_group = ?, quantity = ?, 
            uom = ?, revision = ?, description = ?, is_active = ?, 
            is_default = ?, project_id = ?, root_card_id = ?,
            status = ?, loss_percent = ?
        WHERE id = ?`,
        [
          productName, itemCode, customer || null, bomNumber || null, itemGroup, quantity, uom, revision, 
          description, isActive ? 1 : 0, isDefault ? 1 : 0, 
          projectId || null, rootCardId || null,
          status || 'draft', lossPercent || 0, id
        ]
      );
    } finally {
      if (!connection) conn.release();
    }
  }

  static async clearSubTables(bomId, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      await conn.execute('DELETE FROM bom_components WHERE bom_id = ?', [bomId]);
      await conn.execute('DELETE FROM bom_materials WHERE bom_id = ?', [bomId]);
      await conn.execute('DELETE FROM bom_operations WHERE bom_id = ?', [bomId]);
      await conn.execute('DELETE FROM bom_scrap_loss WHERE bom_id = ?', [bomId]);
    } finally {
      if (!connection) conn.release();
    }
  }

  static async updateStatus(bomId, status, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      await conn.execute(
        'UPDATE bill_of_materials SET status = ? WHERE id = ?',
        [status, bomId]
      );
    } finally {
      if (!connection) conn.release();
    }
  }

  static async delete(bomId, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      await conn.execute('DELETE FROM bom_components WHERE bom_id = ?', [bomId]);
      await conn.execute('DELETE FROM bom_materials WHERE bom_id = ?', [bomId]);
      await conn.execute('DELETE FROM bom_operations WHERE bom_id = ?', [bomId]);
      await conn.execute('DELETE FROM bom_scrap_loss WHERE bom_id = ?', [bomId]);
      await conn.execute('DELETE FROM bill_of_materials WHERE id = ?', [bomId]);
    } finally {
      if (!connection) conn.release();
    }
  }

  static async calculateCosts(bomId) {
    const conn = await pool.getConnection();
    try {
      const [components] = await conn.execute(
        'SELECT COALESCE(SUM(quantity * rate), 0) as total FROM bom_components WHERE bom_id = ?',
        [bomId]
      );

      const [materials] = await conn.execute(
        'SELECT COALESCE(SUM(quantity * rate), 0) as total FROM bom_materials WHERE bom_id = ?',
        [bomId]
      );

      const [operations] = await conn.execute(
        'SELECT COALESCE(SUM(cost), 0) as total FROM bom_operations WHERE bom_id = ?',
        [bomId]
      );

      const [scrapLoss] = await conn.execute(
        `SELECT 
          COALESCE(SUM(input_qty * rate * (loss_percent / 100)), 0) as total 
         FROM bom_scrap_loss WHERE bom_id = ?`,
        [bomId]
      );

      const componentCost = parseFloat(components[0]?.total || 0);
      const materialCost = parseFloat(materials[0]?.total || 0);
      const operationCost = parseFloat(operations[0]?.total || 0);
      const scrapLossCost = parseFloat(scrapLoss[0]?.total || 0);
      
      // Follow point 123: total_bom_cost = material_cost + labor_cost - scrap_loss_cost
      // We include componentCost in material_cost sum
      const totalBOMCost = (materialCost + componentCost + operationCost) - scrapLossCost;

      // Update total_cost in database
      await conn.execute(
        'UPDATE bill_of_materials SET total_cost = ? WHERE id = ?',
        [totalBOMCost, bomId]
      );

      return {
        componentCost,
        materialCost,
        operationCost,
        scrapLossCost,
        totalBOMCost
      };
    } finally {
      conn.release();
    }
  }
}

module.exports = ComprehensiveBOM;
