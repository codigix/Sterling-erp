const pool = require('../config/database');

class ComprehensiveBOM {
  static async create(data, connection = null) {
    const conn = connection || await pool.getConnection();
    try {
      const {
        productName,
        itemCode,
        itemGroup,
        quantity,
        uom,
        revision,
        description,
        isActive,
        isDefault,
        salesOrderId,
        projectId,
        rootCardId,
        createdBy
      } = data;

      const [result] = await conn.execute(
        `INSERT INTO bill_of_materials 
        (product_name, item_code, item_group, quantity, uom, revision, description, 
         is_active, is_default, sales_order_id, project_id, root_card_id, created_by, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [
          productName, itemCode, itemGroup, quantity, uom, revision || 1, 
          description, isActive ? 1 : 0, isDefault ? 1 : 0, 
          salesOrderId || null, projectId || null, rootCardId || null, createdBy
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
        (bom_id, item_name, quantity, uom, item_group, rate, warehouse, operation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [bomId, itemName, quantity, uom, itemGroup, rate || 0, warehouse || null, operation || null]
      );

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

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      'SELECT id FROM bill_of_materials WHERE root_card_id = ? ORDER BY revision DESC LIMIT 1',
      [rootCardId]
    );
    return rows[0];
  }

  static async findById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT bom.*, u.name as created_by_name 
        FROM bill_of_materials bom
        LEFT JOIN employees u ON bom.created_by = u.id
        WHERE bom.id = ?`,
        [id]
      );

      if (!rows[0]) return null;

      const bom = rows[0];
      const [components] = await conn.execute(
        'SELECT * FROM bom_components WHERE bom_id = ?',
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
        components: components || [],
        materials: materials || [],
        operations: operations || [],
        scrapLoss: scrapLoss || []
      };
    } finally {
      conn.release();
    }
  }

  static async getAll() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT bom.*, u.name as created_by_name 
        FROM bill_of_materials bom
        LEFT JOIN employees u ON bom.created_by = u.id
        ORDER BY bom.created_at DESC`
      );
      return rows || [];
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
        itemGroup,
        quantity,
        uom,
        revision,
        description,
        isActive,
        isDefault,
        salesOrderId,
        projectId,
        rootCardId,
        status
      } = data;

      await conn.execute(
        `UPDATE bill_of_materials 
        SET product_name = ?, item_code = ?, item_group = ?, quantity = ?, 
            uom = ?, revision = ?, description = ?, is_active = ?, 
            is_default = ?, sales_order_id = ?, project_id = ?, root_card_id = ?,
            status = ?
        WHERE id = ?`,
        [
          productName, itemCode, itemGroup, quantity, uom, revision, 
          description, isActive ? 1 : 0, isDefault ? 1 : 0, 
          salesOrderId || null, projectId || null, rootCardId || null,
          status || 'draft', id
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

      const componentCost = components[0]?.total || 0;
      const materialCost = materials[0]?.total || 0;
      const operationCost = operations[0]?.total || 0;
      const scrapLossCost = scrapLoss[0]?.total || 0;
      
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
