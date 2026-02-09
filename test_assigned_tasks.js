const pool = require('./backend/config/database');
const EmployeeTask = require('./backend/models/EmployeeTask');

async function test() {
  try {
    const tasks = await EmployeeTask.getAssignedTasks(21, {});
    console.log('Assigned Tasks for Emp 21:', tasks.length);
    console.log('Sample Task:', tasks[0]);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
