const EmployeeTask = require('./backend/models/EmployeeTask');
const Employee = require('./backend/models/Employee');

async function test() {
  try {
    const employeeId = 12; // Sudarshan Kale User ID
    console.log(`Testing for employeeId: ${employeeId}`);

    // Resolve IDs
    let empId = employeeId;
    let userId = employeeId;

    const emp = await Employee.findByUserId(employeeId);
    console.log(`Resolved emp:`, emp ? emp.id : 'null');
    if (emp) {
      empId = emp.id;
      userId = employeeId;
    }

    console.log(`Final IDs - empId: ${empId}, userId: ${userId}`);

    const workerTasks = await EmployeeTask.getEmployeeTasks(userId);
    const assignedTasks = await EmployeeTask.getAssignedTasks(empId, {});

    console.log(`workerTasks found: ${workerTasks.length}`);
    console.log(`assignedTasks found: ${assignedTasks.length}`);

    if (assignedTasks.length > 0) {
        console.log('First assigned task:', assignedTasks[0]);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
