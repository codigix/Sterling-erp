const fs = require('fs');
const filePath = 'D:\\passion\\Sterling-erp\\backend\\models\\EmployeeTask.js';

let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `      ]
    );
    return result.insertId;
  }

  static async getAssignedTasks(employeeId, filters = {}) {`;

const newCode = `      ]
    );

    const taskId = result.insertId;
    
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

    return taskId;
  }

  static async getAssignedTasks(employeeId, filters = {}) {`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Notification code added to createAssignedTask');
} else {
  console.log('✗ Could not find the target code to replace');
}
