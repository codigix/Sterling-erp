const pool = require("../config/database");

class WorkOrder {
  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    try {
      const [result] = await connection.execute(
        `INSERT INTO work_orders 
        (work_order_no, sales_order_id, root_card_id, project_id, item_code, item_name, bom_id, quantity, unit, priority, status, planned_start_date, planned_end_date, notes, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.workOrderNo,
          data.salesOrderId || null,
          data.rootCardId || null,
          data.projectId || null,
          data.itemCode,
          data.itemName || null,
          data.bomId || null,
          data.quantity || 1.0,
          data.unit || 'Nos',
          data.priority || 'medium',
          data.status || 'draft',
          data.plannedStartDate || null,
          data.plannedEndDate || null,
          data.notes || null,
          data.createdBy || null,
          data.createdAt || new Date()
        ]
      );
      return result.insertId;
    } finally {
      if (!externalConnection) connection.release();
    }
  }

  static async createOperation(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    try {
      const [result] = await connection.execute(
        `INSERT INTO work_order_operations 
        (work_order_id, operation_name, workstation, status, sequence, planned_start_date, planned_end_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.workOrderId,
          data.operationName,
          data.workstation || null,
          data.status || 'pending',
          data.sequence,
          data.plannedStartDate || null,
          data.plannedEndDate || null,
          data.notes || null
        ]
      );
      return result.insertId;
    } finally {
      if (!externalConnection) connection.release();
    }
  }

  static async updateOperation(id, data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    try {
      const [result] = await connection.execute(
        `UPDATE work_order_operations SET 
          operation_name = ?, workstation = ?, status = ?, 
          planned_start_date = ?, planned_end_date = ?, 
          notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          data.operationName,
          data.workstation || null,
          data.status,
          data.plannedStartDate || null,
          data.plannedEndDate || null,
          data.notes || null,
          id
        ]
      );
      return result.affectedRows > 0;
    } finally {
      if (!externalConnection) connection.release();
    }
  }

  static async deleteOperation(id) {
    const [result] = await pool.execute("DELETE FROM work_order_operations WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async createInventory(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    try {
      const [result] = await connection.execute(
        `INSERT INTO work_order_inventory 
        (work_order_id, item_code, item_name, required_qty, unit, source_warehouse)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.workOrderId,
          data.itemCode,
          data.itemName || null,
          data.requiredQty,
          data.unit || null,
          data.sourceWarehouse || null
        ]
      );
      return result.insertId;
    } finally {
      if (!externalConnection) connection.release();
    }
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT wo.*, 
             COALESCE(so.po_number, rc.code, rc.title) as sales_order_no, 
             p.name as project_name,
             bom.bom_number as bom_no
      FROM work_orders wo
      LEFT JOIN sales_orders so ON wo.sales_order_id = so.id
      LEFT JOIN root_cards rc ON wo.root_card_id = rc.id
      LEFT JOIN projects p ON wo.project_id = p.id
      LEFT JOIN bill_of_materials bom ON wo.bom_id = bom.id
    `;
    const params = [];
    const conditions = [];

    if (filters.status) {
      conditions.push("wo.status = ?");
      params.push(filters.status);
    }
    if (filters.search) {
      conditions.push("(wo.work_order_no LIKE ? OR wo.item_name LIKE ? OR wo.item_code LIKE ?)");
      const search = `%${filters.search}%`;
      params.push(search, search, search);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY wo.created_at DESC, (CASE WHEN wo.work_order_no LIKE '%-SA-%' THEN 0 ELSE 1 END) ASC, wo.id ASC";

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findAllWithOperations(filters = {}) {
    const workOrders = await this.findAll(filters);
    
    if (workOrders.length === 0) return [];

    const workOrderIds = workOrders.map(wo => wo.id);
    const [operations] = await pool.query(
      "SELECT * FROM work_order_operations WHERE work_order_id IN (?) ORDER BY sequence ASC",
      [workOrderIds]
    );

    // Map operations to their respective work orders
    const opsByWoId = operations.reduce((acc, op) => {
      if (!acc[op.work_order_id]) acc[op.work_order_id] = [];
      acc[op.work_order_id].push(op);
      return acc;
    }, {});

    return workOrders.map(wo => ({
      ...wo,
      operations: opsByWoId[wo.id] || []
    }));
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT wo.*, 
              COALESCE(so.po_number, rc.code, rc.title) as sales_order_no, 
              p.name as project_name,
              bom.bom_number as bom_no
       FROM work_orders wo
       LEFT JOIN sales_orders so ON wo.sales_order_id = so.id
       LEFT JOIN root_cards rc ON wo.root_card_id = rc.id
       LEFT JOIN projects p ON wo.project_id = p.id
       LEFT JOIN bill_of_materials bom ON wo.bom_id = bom.id
       WHERE wo.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;

    const workOrder = rows[0];
    
    const [operations] = await pool.execute(
      "SELECT * FROM work_order_operations WHERE work_order_id = ? ORDER BY sequence ASC",
      [id]
    );
    workOrder.operations = operations;

    const [inventory] = await pool.execute(
      "SELECT * FROM work_order_inventory WHERE work_order_id = ?",
      [id]
    );
    workOrder.inventory = inventory;

    return workOrder;
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT wo.*, 
              COALESCE(so.po_number, rc.code, rc.title) as sales_order_no, 
              p.name as project_name,
              bom.bom_number as bom_no
       FROM work_orders wo
       LEFT JOIN sales_orders so ON wo.sales_order_id = so.id
       LEFT JOIN root_cards rc ON wo.root_card_id = rc.id
       LEFT JOIN projects p ON wo.project_id = p.id
       LEFT JOIN bill_of_materials bom ON wo.bom_id = bom.id
       WHERE wo.sales_order_id = ?`,
      [salesOrderId]
    );
    return rows;
  }

  static async findByRootCardId(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT wo.*, 
              COALESCE(so.po_number, rc.code, rc.title) as sales_order_no, 
              p.name as project_name,
              bom.bom_number as bom_no
       FROM work_orders wo
       LEFT JOIN sales_orders so ON wo.sales_order_id = so.id
       LEFT JOIN root_cards rc ON wo.root_card_id = rc.id
       LEFT JOIN projects p ON wo.project_id = p.id
       LEFT JOIN bill_of_materials bom ON wo.bom_id = bom.id
       WHERE wo.root_card_id = ?`,
      [rootCardId]
    );
    return rows;
  }

  static async update(id, data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    try {
      if (!externalConnection) await connection.beginTransaction();

      const [result] = await connection.execute(
        `UPDATE work_orders SET 
          priority = ?, status = ?, planned_start_date = ?, planned_end_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          data.priority,
          data.status,
          data.plannedStartDate || null,
          data.plannedEndDate || null,
          data.notes || null,
          id
        ]
      );

      if (data.operations && Array.isArray(data.operations)) {
        // Simple sync: delete and recreate for now, or update if id exists
        // For simplicity in this iteration, we'll delete and recreate if no ID is provided for operations
        await connection.execute("DELETE FROM work_order_operations WHERE work_order_id = ?", [id]);
        for (const op of data.operations) {
          await this.createOperation({ ...op, workOrderId: id }, connection);
        }
      }

      if (data.inventory && Array.isArray(data.inventory)) {
        await connection.execute("DELETE FROM work_order_inventory WHERE work_order_id = ?", [id]);
        for (const item of data.inventory) {
          await this.createInventory({ ...item, workOrderId: id }, connection);
        }
      }

      if (!externalConnection) await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      if (!externalConnection) await connection.rollback();
      throw error;
    } finally {
      if (!externalConnection) connection.release();
    }
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM work_orders WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = WorkOrder;
