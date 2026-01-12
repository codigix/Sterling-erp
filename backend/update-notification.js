const fs = require('fs');

const filePath = './models/EmployeeTask.js';
let content = fs.readFileSync(filePath, 'utf8');

const searchStr = `    const taskId = result.insertId;
    
    try {
      const AlertsNotification = require('./AlertsNotification');
      await AlertsNotification.create({
        userId: employeeId,
        alertType: 'task_assigned',
        message: \`You have been assigned a new task: \${data.title}\`,
        relatedTable: 'employee_tasks',
        relatedId: taskId,
        priority: 'high'
      });
      console.log(\`[EmployeeTask] ✓ Notification sent to employee \${employeeId} for task assignment\`);
    } catch (notifError) {
      console.error(\`[EmployeeTask] Error creating task assignment notification:\`, notifError.message);
    }

    return taskId;`;

const replaceStr = `    const taskId = result.insertId;
    
    if (data.productionPlanStageId) {
      try {
        const [stageRows] = await pool.execute(
          'SELECT is_blocked FROM production_plan_stages WHERE id = ?',
          [data.productionPlanStageId]
        );
        
        const isStageBlocked = stageRows.length > 0 && stageRows[0].is_blocked;
        
        if (!isStageBlocked) {
          const AlertsNotification = require('./AlertsNotification');
          await AlertsNotification.create({
            userId: employeeId,
            alertType: 'task_assigned',
            message: \`You have been assigned a new task: \${data.title}\`,
            relatedTable: 'employee_tasks',
            relatedId: taskId,
            priority: 'high'
          });
          console.log(\`[EmployeeTask] ✓ Notification sent to employee \${employeeId} for unblocked task assignment\`);
        } else {
          console.log(\`[EmployeeTask] ℹ️ Task created for employee \${employeeId} but stage is blocked, no notification sent\`);
        }
      } catch (notifError) {
        console.error(\`[EmployeeTask] Error checking stage or sending notification:\`, notifError.message);
      }
    }

    return taskId;`;

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Successfully updated EmployeeTask.createAssignedTask');
  console.log('✓ Now only unblocked stages send task assignment notifications');
} else {
  console.log('✗ Could not find the code to replace');
  console.log('Searching for partial match...');
  if (content.includes('task_assigned')) {
    console.log('Found task_assigned references');
  }
}
