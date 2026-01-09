const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting backfill of production_plan_stage_id for existing tasks...');
    
    // Find all production_stage type tasks without production_plan_stage_id
    const [existingTasks] = await connection.execute(`
      SELECT et.id, et.employee_id, et.notes, et.type, et.production_plan_stage_id
      FROM employee_tasks et
      WHERE et.type = 'production_stage' AND et.production_plan_stage_id IS NULL
    `);

    console.log(`Found ${existingTasks.length} tasks to backfill`);

    let backfillCount = 0;
    let skipCount = 0;

    for (const task of existingTasks) {
      try {
        // Extract stage ID directly from notes field (format: "Stage ID: 80")
        const stageIdMatch = task.notes?.match(/Stage ID: (\d+)/);
        if (!stageIdMatch) {
          console.log(`⚠️  Task ${task.id}: No stage ID found in notes`);
          skipCount++;
          continue;
        }

        const stageId = stageIdMatch[1];
        
        // Verify the stage exists
        const [stages] = await connection.execute(`
          SELECT pps.id, pps.stage_name
          FROM production_plan_stages pps
          WHERE pps.id = ?
        `, [stageId]);

        if (stages.length > 0) {
          await connection.execute(
            'UPDATE employee_tasks SET production_plan_stage_id = ? WHERE id = ?',
            [stageId, task.id]
          );
          backfillCount++;
          console.log(`✓ Task ${task.id}: Updated with production_plan_stage_id ${stageId} (${stages[0].stage_name})`);
        } else {
          console.log(`⚠️  Task ${task.id}: No production plan stage found with ID ${stageId}`);
          skipCount++;
        }
      } catch (err) {
        console.error(`Error processing task ${task.id}:`, err.message);
        skipCount++;
      }
    }

    console.log(`\n✅ Backfill complete: ${backfillCount} updated, ${skipCount} skipped`);
    connection.release();
  } catch (error) {
    connection.release();
    console.error('Backfill failed:', error.message);
    throw error;
  }
};
