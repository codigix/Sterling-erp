const EmployeeTask = require('./backend/models/EmployeeTask');

async function debug() {
  try {
    console.log('Testing EmployeeTask.findByEmployeeId(21)...');
    const tasks = await EmployeeTask.findByEmployeeId(21);
    console.log('Tasks found:', tasks.length);
    if (tasks.length > 0) {
        console.log('First task:', tasks[0]);
    }

    console.log('\nTesting EmployeeTask.findByEmployeeId("21")...');
    const tasksStr = await EmployeeTask.findByEmployeeId("21");
    console.log('Tasks found:', tasksStr.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

debug();
