const pool = require('./backend/config/database');
const Employee = require('./backend/models/Employee');
const EmployeeTask = require('./backend/models/EmployeeTask');

async function testControllerLogic(employeeId) {
  try {
    console.log(`Testing with ID: ${employeeId}`);
    
    // Resolve both employee_id and user_id
    let empId = employeeId;
    let userId = employeeId;

    const employee = await Employee.findById(employeeId);
    if (employee) {
      console.log('Found employee by ID:', employee.id, employee.email);
      const [users] = await pool.execute("SELECT id FROM users WHERE email = ?", [employee.email]);
      if (users.length > 0) userId = users[0].id;
      console.log('Resolved userId:', userId);
    } else {
      console.log('No employee found by ID');
      const emp = await Employee.findByUserId(employeeId);
      if (emp) {
        empId = emp.id;
        userId = employeeId;
        console.log('Found employee by userId:', empId);
      }
    }

    console.log(`Calling getEmployeeTasks(${userId}) and getAssignedTasks(${empId})`);
    const workerTasks = await EmployeeTask.getEmployeeTasks(userId);
    const assignedTasks = await EmployeeTask.getAssignedTasks(empId, {});

    console.log('Worker Tasks count:', workerTasks.length);
    console.log('Assigned Tasks count:', assignedTasks.length);
    
    const allTasksCount = workerTasks.length + assignedTasks.length;
    console.log('Total tasks count:', allTasksCount);

  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

const id = process.argv[2] || 21;
testControllerLogic(id);
