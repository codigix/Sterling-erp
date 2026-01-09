const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting sync of existing task statuses to production plan stages...');
    
    // Find all tasks with production_plan_stage_id populated
    const [tasks] = await connection.execute(`
      SELECT et.id, et.status, et.production_plan_stage_id
      FROM employee_tasks et
      WHERE et.type = 'production_stage' AND et.production_plan_stage_id IS NOT NULL
    `);

    console.log(`Found ${tasks.length} tasks to sync`);

    let syncCount = 0;

    for (const task of tasks) {
      try {
        // Update the production plan stage with the task's status
        const [result] = await connection.execute(
          `UPDATE production_plan_stages SET status = ? WHERE id = ?`,
          [task.status, task.production_plan_stage_id]
        );
        
        if (result.affectedRows > 0) {
          syncCount++;
          console.log(`✓ Task ${task.id}: Synced status '${task.status}' to stage ${task.production_plan_stage_id}`);
        }
      } catch (err) {
        console.error(`Error syncing task ${task.id}:`, err.message);
      }
    }

    console.log(`\n✅ Sync complete: ${syncCount} tasks synced`);
    connection.release();
  } catch (error) {
    connection.release();
    console.error('Sync failed:', error.message);
    throw error;
  }
};
