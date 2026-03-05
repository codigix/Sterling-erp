const pool = require("../config/database");

class WorkOrder {
  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());
    try {
      const [result] = await connection.execute(
        `INSERT INTO work_orders 
        (work_order_no, sales_order_id, root_card_id, production_plan_id, project_id, item_code, item_name, bom_id, quantity, unit, priority, status, planned_start_date, planned_end_date, notes, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.workOrderNo,
          data.salesOrderId || null,
          data.rootCardId || null,
          data.productionPlanId || null,
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
        (work_order_id, operation_name, workstation, type, vendor_id, operator_id, status, sequence, planned_start_date, planned_end_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.workOrderId || data.work_order_id,
          data.operationName || data.operation_name,
          data.workstation || null,
          data.type || 'in-house',
          data.vendorId || data.vendor_id || null,
          data.operatorId || data.operator_id || null,
          data.status || 'pending',
          data.sequence,
          data.plannedStartDate || data.planned_start_date || null,
          data.plannedEndDate || data.planned_end_date || null,
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
          operation_name = ?, workstation = ?, type = ?, vendor_id = ?, operator_id = ?, status = ?, 
          planned_start_date = ?, planned_end_date = ?, 
          notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          data.operationName || data.operation_name,
          data.workstation || null,
          data.type || 'in-house',
          data.vendorId || data.vendor_id || null,
          data.operatorId || data.operator_id || null,
          data.status,
          data.plannedStartDate || data.planned_start_date || null,
          data.plannedEndDate || data.planned_end_date || null,
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
             bom.bom_number as bom_no,
             (
               SELECT 
                 CASE 
                   WHEN COUNT(*) = 0 THEN 0
                   WHEN SUM(CASE WHEN status IN ('completed', 'received') THEN 0 ELSE 1 END) > 0 THEN 0
                   ELSE 1
                 END
               FROM material_requests mr
               WHERE (mr.production_plan_id = wo.production_plan_id AND wo.production_plan_id IS NOT NULL)
                  OR (mr.sales_order_id = wo.sales_order_id AND wo.production_plan_id IS NULL AND wo.sales_order_id IS NOT NULL)
             ) as is_material_ready
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
    if (filters.salesOrderId) {
      conditions.push("wo.sales_order_id = ?");
      params.push(filters.salesOrderId);
    }
    if (filters.rootCardId) {
      conditions.push("wo.root_card_id = ?");
      params.push(filters.rootCardId);
    }
    if (filters.workOrderId) {
      conditions.push("wo.id = ?");
      params.push(filters.workOrderId);
    }
    if (filters.search) {
      conditions.push("(wo.work_order_no LIKE ? OR wo.item_name LIKE ? OR wo.item_code LIKE ?)");
      const search = `%${filters.search}%`;
      params.push(search, search, search);
    }
    if (filters.month && filters.month !== 'all') {
      conditions.push("MONTH(wo.created_at) = ?");
      params.push(filters.month);
    }
    if (filters.year && filters.year !== 'all') {
      conditions.push("YEAR(wo.created_at) = ?");
      params.push(filters.year);
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
      `SELECT woo.*, 
              COALESCE(NULLIF(CONCAT_WS(' ', e.first_name, e.last_name), ''), u.username) as operator_name,
              v.name as vendor_name,
              (SELECT oc.id FROM outward_challans oc WHERE oc.work_order_operation_id = woo.id ORDER BY oc.created_at DESC LIMIT 1) as outward_challan_id,
              (SELECT SUM(oci.quantity) FROM outward_challan_items oci 
               JOIN outward_challans oc ON oci.outward_challan_id = oc.id 
               WHERE oc.work_order_operation_id = woo.id) as dispatched_qty,
              (SELECT SUM(produced_qty) FROM work_order_time_logs wotl WHERE wotl.operation_id = woo.id) as produced_qty,
              (SELECT SUM(accepted_qty) FROM work_order_quality_entries woqe WHERE woqe.operation_id = woo.id) as accepted_qty
       FROM work_order_operations woo 
       LEFT JOIN employees e ON woo.operator_id = e.id
       LEFT JOIN users u ON (e.email = u.email AND e.email IS NOT NULL)
       LEFT JOIN vendors v ON woo.vendor_id = v.id
       WHERE woo.work_order_id IN (?) 
       ORDER BY woo.sequence ASC`,
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
              bom.bom_number as bom_no,
              (
                SELECT 
                  CASE 
                    WHEN COUNT(*) = 0 THEN 0
                    WHEN SUM(CASE WHEN status IN ('completed', 'received') THEN 0 ELSE 1 END) > 0 THEN 0
                    ELSE 1
                  END
                FROM material_requests mr
                WHERE (mr.production_plan_id = wo.production_plan_id AND wo.production_plan_id IS NOT NULL)
                   OR (mr.sales_order_id = wo.sales_order_id AND wo.production_plan_id IS NULL AND wo.sales_order_id IS NOT NULL)
              ) as is_material_ready
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
      `SELECT woo.*, 
              COALESCE(NULLIF(CONCAT_WS(' ', e.first_name, e.last_name), ''), u.username) as operator_name,
              v.name as vendor_name,
              (SELECT oc.id FROM outward_challans oc WHERE oc.work_order_operation_id = woo.id ORDER BY oc.created_at DESC LIMIT 1) as outward_challan_id,
              (SELECT SUM(oci.quantity) FROM outward_challan_items oci 
               JOIN outward_challans oc ON oci.outward_challan_id = oc.id 
               WHERE oc.work_order_operation_id = woo.id) as dispatched_qty
       FROM work_order_operations woo 
       LEFT JOIN employees e ON woo.operator_id = e.id
       LEFT JOIN users u ON (e.email = u.email AND e.email IS NOT NULL)
       LEFT JOIN vendors v ON woo.vendor_id = v.id
       WHERE woo.work_order_id = ? 
       ORDER BY woo.sequence ASC`,
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

  // --- Production Entry Methods ---

  static async startOperation(id, operatorId, workstationId) {
    try {
      // Use execute for prepared statements and COALESCE for cleaner SQL
      const [result] = await pool.execute(
        `UPDATE work_order_operations SET 
          status = 'in_progress', 
          actual_start_date = COALESCE(actual_start_date, NOW()),
          operator_id = COALESCE(?, operator_id),
          workstation_id = COALESCE(?, workstation_id)
         WHERE id = ?`,
        [operatorId || null, workstationId || null, id]
      );

      if (result.affectedRows > 0) {
        // Also update parent work order status to in_progress if it's not already
        const [rows] = await pool.execute(
          "SELECT work_order_id FROM work_order_operations WHERE id = ?",
          [id]
        );
        if (rows && rows.length > 0) {
          await pool.execute(
            "UPDATE work_orders SET status = 'in_progress', actual_start_date = COALESCE(actual_start_date, NOW()) WHERE id = ?",
            [rows[0].work_order_id]
          );
        }
      }
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in WorkOrder.startOperation:", error);
      throw error;
    }
  }

  static async completeOperation(id) {
    try {
      const [result] = await pool.execute(
        `UPDATE work_order_operations SET 
          status = 'completed', 
          actual_end_date = COALESCE(actual_end_date, NOW())
         WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in WorkOrder.completeOperation:", error);
      throw error;
    }
  }

  static async getOperationById(id) {
    const [rows] = await pool.execute(
      `SELECT woo.*, wo.work_order_no, wo.item_name, wo.quantity as target_qty
       FROM work_order_operations woo
       JOIN work_orders wo ON woo.work_order_id = wo.id
       WHERE woo.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async addTimeLog(data) {
    const [result] = await pool.execute(
      `INSERT INTO work_order_time_logs 
      (operation_id, operator_id, workstation_id, start_time, end_time, duration_minutes, produced_qty, shift, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.operationId,
        data.operatorId || null,
        data.workstationId || null,
        data.startTime,
        data.endTime || null,
        data.durationMinutes || null,
        data.producedQty || 0,
        data.shift || null,
        data.notes || null
      ]
    );
    return result.insertId;
  }

  static async addQualityEntry(data) {
    const [result] = await pool.execute(
      `INSERT INTO work_order_quality_entries 
      (operation_id, operator_id, inspection_date, accepted_qty, rejected_qty, scrap_qty, rejection_reason, shift, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.operationId,
        data.operatorId || null,
        data.inspectionDate || new Date(),
        data.acceptedQty || 0,
        data.rejectedQty || 0,
        data.scrapQty || 0,
        data.rejectionReason || null,
        data.shift || null,
        data.notes || null
      ]
    );
    return result.insertId;
  }

  static async addDowntimeLog(data) {
    const [result] = await pool.execute(
      `INSERT INTO work_order_downtime_logs 
      (operation_id, downtime_type, start_time, end_time, duration_minutes, shift, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.operationId,
        data.downtimeType,
        data.startTime,
        data.endTime || null,
        data.durationMinutes || null,
        data.shift || null,
        data.notes || null
      ]
    );
    return result.insertId;
  }

  static async getOperationLogs(operationId) {
    const [timeLogs] = await pool.execute(
      `SELECT tl.*, COALESCE(CONCAT(e.first_name, ' ', e.last_name), u.username) as operator_name, w.display_name as workstation_name
       FROM work_order_time_logs tl
       LEFT JOIN users u ON tl.operator_id = u.id
       LEFT JOIN employees e ON (u.email = e.email AND u.email IS NOT NULL)
       LEFT JOIN workstations w ON tl.workstation_id = w.id
       WHERE tl.operation_id = ? ORDER BY tl.start_time DESC`,
      [operationId]
    );

    const [qualityEntries] = await pool.execute(
      `SELECT qe.*, COALESCE(CONCAT(e.first_name, ' ', e.last_name), u.username) as operator_name
       FROM work_order_quality_entries qe
       LEFT JOIN users u ON qe.operator_id = u.id
       LEFT JOIN employees e ON (u.email = e.email AND u.email IS NOT NULL)
       WHERE qe.operation_id = ? ORDER BY qe.inspection_date DESC`,
      [operationId]
    );

    const [downtimeLogs] = await pool.execute(
      "SELECT * FROM work_order_downtime_logs WHERE operation_id = ? ORDER BY start_time DESC",
      [operationId]
    );

    return {
      timeLogs,
      qualityEntries,
      downtimeLogs
    };
  }
}

module.exports = WorkOrder;
