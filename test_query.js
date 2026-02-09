const pool = require('./backend/config/database');
async function testQuery() {
  try {
    const employeeId = 21;
    let query = `SELECT et.id, et.employee_id, et.title, et.status, 
                        pps.stage_name, woo.operation_name, wo.work_order_no
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
    console.log('--- Query Results for Employee 21 ---');
    console.log(JSON.stringify(rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
testQuery();
