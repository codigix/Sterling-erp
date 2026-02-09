const pool = require('./backend/config/database');
async function check() {
  try {
    const employeeId = 21;
    let query = `SELECT et.id, et.employee_id, et.title, et.description, et.type, et.priority, et.status, 
                        et.assigned_by, et.due_date, et.notes, et.started_at, et.completed_at, 
                        et.created_at, et.updated_at, et.production_plan_stage_id, et.work_order_operation_id, et.sales_order_id,
                        pps.stage_name, woo.operation_name, wo.work_order_no, wo.item_name,
                        COALESCE(rc.title, so.project_name, so.po_number, wo.item_name) as root_card_title,
                        COALESCE(p.id, p2.id, p3.id) as project_id, 
                        COALESCE(p.name, p2.name, p3.name) as project_name, 
                        COALESCE(p.code, p2.code, p3.code) as project_code,
                        COALESCE(sod.product_details, so.items) as product_details,
                        COALESCE(so.customer, so2.customer) as customer_name,
                        COALESCE(so.po_number, so2.po_number) as po_number
                 FROM employee_tasks et
                 LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
                 LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
                 LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
                 LEFT JOIN projects p ON rc.project_id = p.id
                 LEFT JOIN sales_orders so ON et.sales_order_id = so.id
                 LEFT JOIN projects p2 ON so.id = p2.sales_order_id
                 LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
                 LEFT JOIN work_order_operations woo ON et.work_order_operation_id = woo.id
                 LEFT JOIN work_orders wo ON woo.work_order_id = wo.id
                 LEFT JOIN sales_orders so2 ON wo.sales_order_id = so2.id
                 LEFT JOIN projects p3 ON wo.project_id = p3.id
                 WHERE et.employee_id = ? AND (pps.id IS NULL OR pps.is_blocked = FALSE)`;
    
    const [rows] = await pool.execute(query, [employeeId]);
    console.log('Query Results:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
