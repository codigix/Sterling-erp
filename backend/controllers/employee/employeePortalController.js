const Employee = require('../../models/Employee');
const EmployeeTask = require('../../models/EmployeeTask');
const Department = require('../../models/Department');
const Attendance = require('../../models/Attendance');
const CompanyUpdate = require('../../models/CompanyUpdate');
const AlertsNotification = require('../../models/AlertsNotification');
const ManufacturingStage = require('../../models/ManufacturingStage');
const RootCard = require('../../models/RootCard');
const ProductionPlan = require('../../models/ProductionPlan');
const DepartmentTask = require('../../models/DepartmentTask');
const WorkOrder = require('../../models/WorkOrder');
const bcrypt = require('bcryptjs');

exports.getAllEmployees = async (req, res) => {
  try {
    const pool = require('../../config/database');
    const [rows] = await pool.execute(`
      SELECT 
        e.id as emp_id,
        u.id as user_id,
        e.login_id,
        e.first_name,
        e.last_name,
        e.email,
        e.designation,
        d.name as department_name,
        e.department_id,
        e.role_id,
        r.name as role_name,
        e.status
      FROM employees e
      LEFT JOIN users u ON (e.email = u.email AND e.email IS NOT NULL)
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN roles r ON e.role_id = r.id
      ORDER BY e.first_name ASC
    `);
    
    const formatted = rows.map(emp => ({
      id: emp.user_id || emp.emp_id,
      name: `${emp.first_name} ${emp.last_name}`,
      employee_id: emp.login_id,
      email: emp.email,
      designation: emp.designation,
      department: emp.department_name,
      departmentId: emp.department_id,
      roleId: emp.role_id,
      role: emp.role_name,
      status: emp.status
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({ message: 'Department ID is required' });
    }

    const employees = await Employee.findByDepartmentId(departmentId);
    
    const formatted = employees.map(emp => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      email: emp.email,
      designation: emp.designation,
      department: emp.department_name || emp.department,
      departmentId: emp.department_id,
      roleId: emp.role_id,
      role: emp.role_name,
      status: emp.status
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper to resolve employee and user IDs regardless of which one is provided
const resolveIds = async (input_id) => {
  if (!input_id) return { empId: null, userId: null, employee: null };
  
  const id = String(input_id).trim();
  let empId = id;
  let userId = id;
  let employee = null;

  // SPECIAL MAPPING for Sudarshan Kale due to frontend hardcoding (ID 21)
  if (id === '21' || id === 'demo-sudarshan.kale') {
    const pool = require('../../config/database');
    const [rows] = await pool.execute(
      "SELECT e.id as emp_id, u.id as user_id FROM employees e JOIN users u ON e.email = u.email WHERE e.login_id = 'sudarshan.kale' OR u.username = 'sudarshan.kale' LIMIT 1"
    );
    if (rows.length > 0) {
      console.log(`[resolveIds] SPECIAL MAPPING applied for Sudarshan: ${id} -> empId: ${rows[0].emp_id}, userId: ${rows[0].user_id}`);
      empId = rows[0].emp_id;
      userId = rows[0].user_id;
      employee = await Employee.findById(empId);
      return { empId, userId, employee };
    }
  }

  // Try finding by User ID first
  const emp = await Employee.findByUserId(id);
  if (emp) {
    empId = emp.id;
    userId = id;
    employee = emp;
    console.log(`[resolveIds] Found employee ${empId} for user ID ${id}`);
  } else {
    // Try finding by Employee ID (login_id or database id)
    employee = await Employee.findById(id);
    if (employee) {
      empId = employee.id;
      const pool = require('../../config/database');
      const [users] = await pool.execute("SELECT id FROM users WHERE email = ?", [employee.email]);
      if (users.length > 0) {
        userId = users[0].id;
      }
      console.log(`[resolveIds] Found user ${userId} for employee ID ${id}`);
    } else {
      // Fallback: search by name/username if id is a string like "demo-sudarshan.kale"
      const searchStr = String(id).replace('demo-', '').replace('.', ' ');
      const pool = require('../../config/database');
      const [emps] = await pool.execute(
        "SELECT id, email FROM employees WHERE CONCAT(first_name, ' ', last_name) LIKE ? OR email LIKE ?", 
        [`%${searchStr}%`, `%${searchStr}%`]
      );
      if (emps.length > 0) {
        empId = emps[0].id;
        const [users] = await pool.execute("SELECT id FROM users WHERE email = ?", [emps[0].email]);
        if (users.length > 0) userId = users[0].id;
        console.log(`[resolveIds] Resolved "${id}" via name search to empId: ${empId}, userId: ${userId}`);
      }
    }
  }

  return { empId, userId, employee };
};

exports.getEmployeeStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const { empId, userId } = await resolveIds(employeeId);

    if (!empId && !userId) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get stats from both tables
    const pool = require('../../config/database');
    
    // worker_tasks (using userId)
    const [workerStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM worker_tasks
       WHERE worker_id = ?`,
      [userId]
    );

    // employee_tasks (using empId)
    const [assignedStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM employee_tasks
       WHERE employee_id = ?`,
      [empId]
    );

    const stats = {
      total: (workerStats[0]?.total || 0) + (assignedStats[0]?.total || 0),
      pending: (workerStats[0]?.pending || 0) + (assignedStats[0]?.pending || 0),
      in_progress: (workerStats[0]?.in_progress || 0) + (assignedStats[0]?.in_progress || 0),
      completed: (workerStats[0]?.completed || 0) + (assignedStats[0]?.completed || 0),
      // Also provide fields expected by frontend
      tasksPending: (workerStats[0]?.pending || 0) + (assignedStats[0]?.pending || 0),
      tasksInProgress: (workerStats[0]?.in_progress || 0) + (assignedStats[0]?.in_progress || 0),
      tasksCompleted: (workerStats[0]?.completed || 0) + (assignedStats[0]?.completed || 0),
      attendanceRate: 100, // Placeholder
      hoursLogged: 0 // Placeholder
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const { empId, userId, employee } = await resolveIds(employeeId);

    if (!empId && !userId) {
      console.error(`[getEmployeeTasks] Could not resolve IDs for input: ${employeeId}`);
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log(`[getEmployeeTasks] Resolved input "${employeeId}" to empId: ${empId}, userId: ${userId}`);
    
    // Debug: check direct table count
    const pool = require('../../config/database');
    const [debugCount] = await pool.execute("SELECT COUNT(*) as count FROM employee_tasks WHERE employee_id = ?", [empId]);
    console.log(`[getEmployeeTasks] DB COUNT for empId ${empId}: ${debugCount[0].count}`);

    const workerTasks = await EmployeeTask.getEmployeeTasks(userId);
    const assignedTasks = await EmployeeTask.getAssignedTasks(empId, {});
    console.log(`[getEmployeeTasks] Found workerTasks: ${workerTasks.length}, assignedTasks: ${assignedTasks.length}`);

    const normalizedWorkerTasks = workerTasks.map(t => ({
      id: t.id,
      title: t.task,
      description: `${t.stage_name || 'Unknown'} - Production Stage`,
      type: 'worker_task',
      task_type: 'worker_task',
      status: t.status,
      priority: t.priority || 'medium',
      project_id: t.project_id,
      project_code: t.project_code,
      root_card_id: t.root_card_id,
      root_card_title: t.root_card_title,
      root_card_code: t.root_card_code,
      root_card_name: t.root_card_name,
      job_card_no: t.job_card_no,
      stage_name: t.stage_name,
      sales_order_id: t.sales_order_id,
      po_number: t.po_number,
      created_at: t.created_at,
      due_date: t.due_date,
      taskType: 'worker',
      customer: 'Confidential',
      project_name: 'Production Project'
    }));

    const normalizedAssignedTasks = assignedTasks.map(t => {
      // Calculate dynamic Job Card number for production operations
      let job_card_no = t.job_card_no;
      if (t.type === 'job_card' && t.work_order_operation_id) {
        const woSuffix = t.work_order_no?.split('-')?.pop() || t.work_order_id;
        job_card_no = `JC-${woSuffix}-${t.work_order_operation_id}`;
      }

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        type: t.type,
        task_type: t.type, // 'job_card' or other types
        reference_id: t.work_order_operation_id || t.production_plan_stage_id || t.sales_order_id,
        status: t.status,
        priority: t.priority || 'medium',
        project_id: t.project_id,
        project_code: t.project_code,
        root_card_title: t.root_card_title,
        root_card_code: t.root_card_code,
        root_card_name: t.root_card_name,
        stage_name: t.stage_name,
        work_order_no: t.work_order_no,
        job_card_no: job_card_no,
        item_name: t.item_name,
        sales_order_id: t.sales_order_id,
        po_number: t.po_number,
        assigned_by: t.assigned_by,
        due_date: t.due_date,
        notes: t.notes,
        created_at: t.created_at,
        started_at: t.started_at,
        completed_at: t.completed_at,
        taskType: 'assigned',
        customer: 'Confidential',
        project_name: 'Production Project'
      };
    });

    const allTasks = [...normalizedWorkerTasks, ...normalizedAssignedTasks];

    res.json(allTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Resolve employee_id - Prioritize user_id mapping
    let empId = employeeId;
    const emp = await Employee.findByUserId(employeeId);
    if (emp) {
      empId = emp.id;
    }

    const attendance = await Attendance.findByEmployeeId(empId);
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeProjects = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Resolve both IDs
    let empId = employeeId;
    let userId = employeeId;
    const emp = await Employee.findByUserId(employeeId);
    if (emp) {
      empId = emp.id;
    } else {
      const e = await Employee.findById(employeeId);
      if (e) {
        const pool = require('../../config/database');
        const [users] = await pool.execute("SELECT id FROM users WHERE email = ?", [e.email]);
        if (users.length > 0) userId = users[0].id;
      }
    }

    const tasks = await EmployeeTask.getEmployeeTasks(userId);
    const projects = [...new Map(tasks.map(t => [t.project_id, t])).values()];

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployeeAlerts = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const { userId } = await resolveIds(employeeId);

    if (!userId) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`[getEmployeeAlerts] Final userId: ${userId}`);
    const rawAlerts = await AlertsNotification.findByUserId(userId);
    console.log(`[getEmployeeAlerts] Found alerts: ${rawAlerts.length}`);
    
    // Transform raw alerts to match frontend expectations
    const alerts = rawAlerts.map(alert => ({
      id: alert.id,
      title: alert.alert_type ? alert.alert_type.replace(/_/g, ' ').toUpperCase() : 'Notification',
      message: alert.message,
      type: alert.priority === 'high' ? 'error' : alert.priority === 'medium' ? 'warning' : 'info',
      alertType: alert.alert_type,
      timestamp: alert.created_at,
      created_at: alert.created_at,
      read: !!alert.is_read,
      is_read: !!alert.is_read,
      priority: alert.priority,
      link: alert.link,
      relatedTable: alert.related_table,
      relatedId: alert.related_id,
      sender: alert.sender_name || 'System'
    }));

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCompanyUpdates = async (req, res) => {
  try {
    const updates = await CompanyUpdate.findAll();
    res.json(updates);
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.assignTaskToEmployee = async (req, res) => {
  try {
    const { employeeId, title, description, type, priority, dueDate, notes } = req.body;

    if (!employeeId || !title) {
      return res.status(400).json({ message: 'Employee ID and title are required' });
    }

    const taskId = await EmployeeTask.createAssignedTask(employeeId, {
      title,
      description,
      type,
      priority,
      dueDate,
      notes
    });

    const task = await EmployeeTask.getAssignedTaskById(taskId);

    res.status(201).json({
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAssignedTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, type, priority } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Resolve employee_id - Prioritize user_id mapping
    let empId = employeeId;
    const emp = await Employee.findByUserId(employeeId);
    if (emp) {
      empId = emp.id;
    }

    const tasks = await EmployeeTask.getAssignedTasks(empId, { status, type, priority });
    res.json(tasks);
  } catch (error) {
    console.error('Get assigned tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAssignedTasksStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Resolve employee_id - Prioritize user_id mapping
    let empId = employeeId;
    const emp = await Employee.findByUserId(employeeId);
    if (emp) {
      empId = emp.id;
    }

    const stats = await EmployeeTask.getAssignedTasksStats(empId);
    res.json(stats);
  } catch (error) {
    console.error('Get assigned tasks stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body;

    if (!taskId || !status) {
      return res.status(400).json({ message: 'Task ID and status are required' });
    }

    let task = await EmployeeTask.getAssignedTaskById(taskId);
    if (!task) {
      task = await EmployeeTask.findById(taskId);
    }

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.employee_id) {
      const { producedQty, rejectedQty, scrapQty, notes: completionNotes } = req.body;
      await EmployeeTask.updateAssignedTaskStatus(taskId, status, notes || completionNotes);
      const updatedTask = await EmployeeTask.getAssignedTaskById(taskId);
      
      const { userId: taskOwnerUserId } = await resolveIds(task.employee_id);

      // Handle completion flow - Notify Production Department
      if (status === 'completed' && task.status !== 'completed') {
        try {
          const pool = require('../../config/database');
          
          // 1. Find Production Role ID
          const [roles] = await pool.execute("SELECT id FROM roles WHERE LOWER(name) = 'production' OR LOWER(name) = 'production_manager' ORDER BY (CASE WHEN LOWER(name) = 'production' THEN 0 ELSE 1 END) LIMIT 1");
          let productionRoleId = roles.length > 0 ? roles[0].id : null;
          
          // Fallback to role ID 5 if not found by name
          if (!productionRoleId) {
            const [fallbackRoles] = await pool.execute("SELECT id FROM roles WHERE id = 5 LIMIT 1");
            if (fallbackRoles.length > 0) productionRoleId = 5;
          }
          
          if (productionRoleId) {
            const operationId = updatedTask.work_order_operation_id;
            
            // Prepare production entry details for auto-filling
            const startTime = updatedTask.started_at ? new Date(updatedTask.started_at).toISOString() : '';
            const endTime = updatedTask.completed_at ? new Date(updatedTask.completed_at).toISOString() : new Date().toISOString();
            const operatorId = updatedTask.employee_id;
            
            let entryLink = operationId ? `/department/production/operations/${operationId}/entry` : '/department/production/department-tasks';
            
            // Add query parameters for auto-filling
            const queryParams = new URLSearchParams();
            if (operatorId) queryParams.append('operatorId', operatorId);
            if (startTime) queryParams.append('startTime', startTime);
            if (endTime) queryParams.append('endTime', endTime);
            if (producedQty) queryParams.append('producedQty', producedQty);
            if (rejectedQty) queryParams.append('rejectedQty', rejectedQty);
            if (scrapQty) queryParams.append('scrapQty', scrapQty);
            if (completionNotes || updatedTask.notes) queryParams.append('notes', completionNotes || updatedTask.notes);
            
            const qs = queryParams.toString();
            if (qs) entryLink += (entryLink.includes('?') ? '&' : '?') + qs;

            // 4. Resolve IDs if missing in the task record
            let rootCardId = updatedTask.root_card_id;
            let salesOrderId = updatedTask.sales_order_id;
            let finalOperationId = operationId;

            if (!rootCardId && salesOrderId) {
              const [rcData] = await pool.execute('SELECT id FROM root_cards WHERE sales_order_id = ? LIMIT 1', [salesOrderId]);
              if (rcData.length > 0) {
                rootCardId = rcData[0].id;
              }
            }

            if ((!rootCardId || !salesOrderId || !finalOperationId) && operationId) {
              const [opData] = await pool.execute(`
                SELECT wo.root_card_id, wo.sales_order_id, woo.id as valid_op_id
                FROM work_order_operations woo 
                JOIN work_orders wo ON woo.work_order_id = wo.id 
                WHERE woo.id = ?`, 
                [operationId]
              );
              if (opData.length > 0) {
                rootCardId = rootCardId || opData[0].root_card_id;
                salesOrderId = salesOrderId || opData[0].sales_order_id;
                finalOperationId = opData[0].valid_op_id;

                // Fallback: If rootCardId is still null but we have salesOrderId, find it from root_cards table
                if (!rootCardId && salesOrderId) {
                  const [rcData] = await pool.execute('SELECT id FROM root_cards WHERE sales_order_id = ? LIMIT 1', [salesOrderId]);
                  if (rcData.length > 0) {
                    rootCardId = rcData[0].id;
                  }
                }
              } else {
                console.warn(`[employeePortalController] Operation ID ${operationId} is invalid. Setting to null.`);
                finalOperationId = null;
              }
            }

            // 3. Create Department Task for Production Entry if it doesn't exist
            const taskTitle = `Production Entry Required: ${updatedTask.operation_name || updatedTask.title?.replace('Job Card Operation: ', '') || 'New Operation'}`;
            
            const connection = await pool.getConnection();
            try {
              await connection.beginTransaction();

              // Verify foreign keys exist to avoid constraint failures
              if (rootCardId) {
                const [rcCheck] = await connection.execute('SELECT id FROM root_cards WHERE id = ?', [rootCardId]);
                if (rcCheck.length === 0) rootCardId = null;
              }
              
              if (salesOrderId) {
                const [soCheck] = await connection.execute('SELECT id FROM sales_orders WHERE id = ?', [salesOrderId]);
                if (soCheck.length === 0) salesOrderId = null;
              }

              if (finalOperationId) {
                const [opCheck] = await connection.execute('SELECT id FROM work_order_operations WHERE id = ?', [finalOperationId]);
                if (opCheck.length === 0) finalOperationId = null;
              }

              let existingTask = null;
              if (finalOperationId) {
                const [rows] = await connection.execute(
                  `SELECT id FROM department_tasks WHERE work_order_operation_id = ? AND task_title = ? LIMIT 1 FOR UPDATE`,
                  [finalOperationId, taskTitle]
                );
                existingTask = rows[0];
              }
              
              if (!existingTask) {
                let query = 'SELECT id FROM department_tasks WHERE task_title = ? AND role_id = ?';
                const params = [taskTitle, productionRoleId];
                if (rootCardId) {
                  query += ' AND root_card_id = ?';
                  params.push(rootCardId);
                } else {
                  query += ' AND root_card_id IS NULL';
                }
                query += ' LIMIT 1 FOR UPDATE';
                
                const [rows] = await connection.execute(query, params);
                existingTask = rows[0];
              }

              if (!existingTask) {
                const [result] = await connection.execute(
                  `INSERT INTO department_tasks (
                    root_card_id, role_id, task_title, task_description, 
                    status, priority, assigned_by, notes, 
                    sales_order_id, work_order_operation_id, link
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    rootCardId || null, productionRoleId, taskTitle, 
                    `Task "${updatedTask.title}" has been completed by ${req.user?.name || 'Employee'}. Now do the production entry for Work Order: ${updatedTask.work_order_no || 'N/A'}.`,
                    'pending', updatedTask.priority || 'medium', taskOwnerUserId || req.user?.id || null,
                    JSON.stringify({
                      autoFill: {
                        operatorId,
                        startTime,
                        endTime,
                        producedQty,
                        rejectedQty,
                        scrapQty,
                        notes: completionNotes || updatedTask.notes,
                        operationId: finalOperationId
                      }
                    }),
                    salesOrderId || null, finalOperationId || null, entryLink
                  ]
                );
                console.log(`[employeePortalController] ✓ Created Department Task ID: ${result.insertId} for ${taskTitle}`);
              } else {
                console.log(`[employeePortalController] ℹ️ Department Task for ${taskTitle} already exists, skipping`);
              }

              await connection.commit();
            } catch (txErr) {
              await connection.rollback();
              console.error('[employeePortalController] Transaction error in task flow:', txErr.message);
            } finally {
              connection.release();
            }
            
            // 4. Notify Production Department (Production Managers and Production role users)
            try {
              const [managerUsers] = await pool.execute(`
                SELECT DISTINCT u.id 
                FROM users u 
                JOIN roles r ON u.role_id = r.id
                WHERE (LOWER(r.name) = 'production' OR LOWER(r.name) = 'production_manager') AND u.id != ?
              `, [req.user?.id]);
              
              console.log(`[employeePortalController] Notifying ${managerUsers.length} production users`);
              
              for (const mUser of managerUsers) {
                await AlertsNotification.create({
                  userId: mUser.id,
                  fromUserId: req.user?.id || null,
                  alertType: 'status_update',
                  message: `📢 Production Entry Required: ${updatedTask.operation_name || updatedTask.title} (WO: ${updatedTask.work_order_no || 'N/A'}) is ready for entry.`,
                  relatedTable: 'employee_tasks',
                  relatedId: taskId,
                  priority: 'high',
                  link: entryLink
                });
              }
            } catch (notifErr) {
              console.error('[employeePortalController] Error sending notifications:', notifErr.message);
            }
          }
        } catch (flowError) {
          console.error('Error in task completion flow:', flowError);
        }
      }

      res.json({
        message: 'Task status updated successfully',
        data: updatedTask
      });
      return; // ADDED: Prevent falling through to worker tasks logic
    } else {
      const { producedQty, rejectedQty, scrapQty, notes: completionNotes } = req.body;
      await EmployeeTask.updateStatus(taskId, status);
      const updatedTask = await EmployeeTask.findById(taskId);
      
      // Handle worker task completion flow
      if (status === 'completed' && task.status !== 'completed') {
        try {
          const pool = require('../../config/database');
          const [roles] = await pool.execute("SELECT id FROM roles WHERE LOWER(name) = 'production' OR LOWER(name) = 'production_manager' ORDER BY (CASE WHEN LOWER(name) = 'production' THEN 0 ELSE 1 END) LIMIT 1");
          let productionRoleId = roles.length > 0 ? roles[0].id : null;
          
          // Fallback to role ID 5 if not found by name
          if (!productionRoleId) {
            const [fallbackRoles] = await pool.execute("SELECT id FROM roles WHERE id = 5 LIMIT 1");
            if (fallbackRoles.length > 0) productionRoleId = 5;
          }
          
          if (productionRoleId) {
            // Prepare production entry details for auto-filling
            const endTime = new Date().toISOString();
            let startTime = updatedTask.created_at ? new Date(updatedTask.created_at).toISOString() : endTime;
            
            // Try to find when it was actually started from logs
            if (updatedTask.logs) {
              try {
                const logs = typeof updatedTask.logs === 'string' ? JSON.parse(updatedTask.logs) : updatedTask.logs;
                if (Array.isArray(logs)) {
                  const startLog = logs.find(l => l.status === 'in_progress');
                  if (startLog && startLog.timestamp) {
                    startTime = new Date(startLog.timestamp).toISOString();
                  }
                }
              } catch (e) {
                console.warn('[employeePortalController] Error parsing worker task logs:', e.message);
              }
            }

            const operatorId = updatedTask.worker_id;
            const operatorUserId = req.user?.id;
            
            let entryLink = '/department/production/department-tasks';
            const taskTitle = `Production Entry Required: ${updatedTask.task}`;

            // Add query parameters for auto-filling if we can determine the link
            const queryParams = new URLSearchParams();
            if (operatorId) queryParams.append('operatorId', operatorId);
            if (startTime) queryParams.append('startTime', startTime);
            if (endTime) queryParams.append('endTime', endTime);
            
            const qs = queryParams.toString();
            if (qs) entryLink += `?${qs}`;

            // Resolve IDs if missing in the task record
            let rootCardId = updatedTask.root_card_id;
            let salesOrderId = updatedTask.sales_order_id;

            if (!rootCardId && updatedTask.worker_id) {
               // No operation_id for worker tasks usually, try finding by task/root_card_title
               const [rcData] = await pool.execute("SELECT id, sales_order_id FROM root_cards WHERE title = ? LIMIT 1", [updatedTask.root_card_title]);
               if (rcData.length > 0) {
                 rootCardId = rcData[0].id;
                 salesOrderId = salesOrderId || rcData[0].sales_order_id;
               }
            }

            const connection = await pool.getConnection();
            try {
              await connection.beginTransaction();

              // Verify if rootCardId and salesOrderId actually exist IN THE TRANSACTION CONNECTION
              if (rootCardId) {
                const [rcCheck] = await connection.execute('SELECT id FROM root_cards WHERE id = ?', [rootCardId]);
                if (rcCheck.length === 0) {
                  console.warn(`[employeePortalController] WARNING: root_card_id ${rootCardId} not found. Setting to null.`);
                  rootCardId = null;
                }
              }
              
              if (salesOrderId) {
                const [soCheck] = await connection.execute('SELECT id FROM sales_orders WHERE id = ?', [salesOrderId]);
                if (soCheck.length === 0) {
                  console.warn(`[employeePortalController] WARNING: sales_order_id ${salesOrderId} not found. Setting to null.`);
                  salesOrderId = null;
                }
              }

              let query = 'SELECT id FROM department_tasks WHERE task_title = ? AND role_id = ?';
              const params = [taskTitle, productionRoleId];
              if (rootCardId) {
                query += ' AND root_card_id = ?';
                params.push(rootCardId);
              } else {
                query += ' AND root_card_id IS NULL';
              }
              query += ' LIMIT 1 FOR UPDATE';
              
              const [rows] = await connection.execute(query, params);
              let existingTask = rows[0];

              if (!existingTask) {
                // Create Department Task for Production Entry
                const [result] = await connection.execute(
                  `INSERT INTO department_tasks (
                    root_card_id, role_id, task_title, task_description, 
                    status, priority, assigned_by, notes, 
                    sales_order_id, link
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    rootCardId || null, productionRoleId, taskTitle, 
                    `Worker ${req.user?.name || 'Employee'} has completed the task: ${updatedTask.task} for Root Card: ${updatedTask.root_card_title || 'N/A'}. Please do the production entry.`,
                    'pending', updatedTask.priority || 'medium', updatedTask.worker_id || req.user?.id || null,
                    JSON.stringify({
                      autoFill: {
                        operatorId,
                        startTime,
                        endTime,
                        producedQty,
                        rejectedQty,
                        scrapQty,
                        notes: completionNotes,
                        taskName: updatedTask.task,
                        rootCardTitle: updatedTask.root_card_title
                      }
                    }),
                    salesOrderId || null, entryLink
                  ]
                );
                console.log(`[employeePortalController] ✓ Created Worker Department Task ID: ${result.insertId} for ${taskTitle}`);
              } else {
                console.log(`[employeePortalController] ℹ️ Worker Department Task for ${taskTitle} already exists, skipping`);
              }

              await connection.commit();
            } catch (txErr) {
              await connection.rollback();
              console.error('[employeePortalController] Transaction error in worker task flow:', txErr.message);
            } finally {
              connection.release();
            }

            // Notify Production Department (Production Managers and Production role users)
            try {
              const [managerUsers] = await pool.execute(`
                SELECT DISTINCT u.id 
                FROM users u 
                JOIN roles r ON u.role_id = r.id
                WHERE (LOWER(r.name) = 'production' OR LOWER(r.name) = 'production_manager') AND u.id != ?
              `, [req.user?.id]);
              
              console.log(`[employeePortalController] Notifying ${managerUsers.length} production users for worker task`);

              for (const mUser of managerUsers) {
                await AlertsNotification.create({
                  userId: mUser.id,
                  fromUserId: req.user?.id || null,
                  alertType: 'status_update',
                  message: `📢 Worker task completed: ${updatedTask.task} (Root Card: ${updatedTask.root_card_title || 'N/A'}). Production Entry required.`,
                  relatedTable: 'employee_tasks',
                  relatedId: taskId,
                  priority: 'high',
                  link: entryLink
                });
              }
            } catch (notifErr) {
              console.error('[employeePortalController] Notification error in worker task flow:', notifErr.message);
            }
          }
        } catch (flowError) {
          console.error('Error in worker task completion flow:', flowError);
        }
      }

      res.json({
        message: 'Task status updated successfully',
        data: updatedTask
      });
    }
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteAssignedTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await EmployeeTask.getAssignedTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await EmployeeTask.deleteAssignedTask(taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteWorkerTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const task = await EmployeeTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await EmployeeTask.deleteWorkerTask(taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete worker task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { firstName, lastName, designation } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (designation) updateData.designation = designation;

    if (Object.keys(updateData).length > 0) {
      await Employee.update(employeeId, updateData);
    }

    const updatedEmployee = await Employee.findById(employeeId);

    res.json({
      message: 'Profile updated successfully',
      employee: {
        id: updatedEmployee.id,
        name: `${updatedEmployee.first_name} ${updatedEmployee.last_name}`,
        email: updatedEmployee.email,
        designation: updatedEmployee.designation,
        department: updatedEmployee.department_name,
        role: updatedEmployee.role_name
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!employeeId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Employee ID, current password, and new password are required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const passwordMatch = await Employee.verifyPassword(currentPassword, employee.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Employee.update(employeeId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
