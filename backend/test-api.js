const EmployeeTask = require('./models/EmployeeTask');

async function testTasks() {
  try {
    console.log('\n=== Testing getEmployeeTasks ===');
    const workerTasks = await EmployeeTask.getEmployeeTasks(18);
    console.log('Worker tasks:', workerTasks.length, workerTasks);

    console.log('\n=== Testing getAssignedTasks ===');
    const assignedTasks = await EmployeeTask.getAssignedTasks(18, {});
    console.log('Assigned tasks:', assignedTasks.length, assignedTasks);

    console.log('\n=== Combined ===');
    const allTasks = [
      ...workerTasks.map(t => ({ ...t, taskType: 'worker' })),
      ...assignedTasks.map(t => ({ ...t, taskType: 'assigned' }))
    ];
    console.log('Total tasks:', allTasks.length);
    console.log(JSON.stringify(allTasks, null, 2));

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

testTasks();
