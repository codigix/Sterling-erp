const pool = require('./backend/config/database');

async function debug() {
  const employeeId = 21;
  const query = `SELECT et.id, et.employee_id, et.title, et.description, et.type, et.priority, et.status, 
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
  
  try {
    const [so10] = await pool.execute('SELECT * FROM sales_orders WHERE id = 10');
    console.log('Sales Order 10:', so10[0]);
    
    const [distinctSos] = await pool.execute('SELECT DISTINCT sales_order_id FROM work_orders');
    console.log('Distinct Sales Order IDs in work_orders:', distinctSos.map(s => s.sales_order_id).join(', '));
    
    const [sos] = await pool.execute('SELECT id FROM sales_orders');
    console.log('Available Sales Order IDs:', sos.map(s => s.id).join(', '));
    
    const [counts] = await pool.execute('SELECT employee_id, COUNT(*) as count FROM employee_tasks GROUP BY employee_id');
    console.log('Task counts by employee_id:', counts);
    
    const [allTasks] = await pool.execute('SELECT * FROM employee_tasks WHERE employee_id = 21');
    console.log('All tasks for employee 21 in DB:', allTasks.length);
    allTasks.forEach(t => console.log(`ID: ${t.id}, Title: ${t.title}, PPS_ID: ${t.production_plan_stage_id}, WO_OP_ID: ${t.work_order_operation_id}`));

    const [rows] = await pool.execute(query, [employeeId]);
    console.log(`Found ${rows.length} rows`);
    console.log('Task IDs:', rows.map(r => r.id).join(', '));
    if (rows.length === 0) {
        console.log('No rows found. Checking individual joins...');
        
        const [et] = await pool.execute('SELECT * FROM employee_tasks WHERE employee_id = ?', [employeeId]);
        console.log(`employee_tasks count: ${et.length}`);
        
        if (et.length > 0) {
            const task = et[0];
            console.log('Sample task:', task);
            
            if (task.sales_order_id) {
                const [so] = await pool.execute('SELECT * FROM sales_orders WHERE id = ?', [task.sales_order_id]);
                console.log(`sales_order ID ${task.sales_order_id} exists: ${so.length > 0}`);
            }
            
            if (task.work_order_operation_id) {
                const [woo] = await pool.execute('SELECT * FROM work_order_operations WHERE id = ?', [task.work_order_operation_id]);
                console.log(`work_order_operation ID ${task.work_order_operation_id} exists: ${woo.length > 0}`);
            }
        }
    } else {
        console.log('Sample row:', rows[0]);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

debug();
