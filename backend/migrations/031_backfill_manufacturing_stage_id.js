const pool = require('../config/database');

module.exports = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting backfill of manufacturing_stage_id for existing tasks...');
    
    const [existingTasks] = await connection.execute(`
      SELECT et.id, et.employee_id, et.notes, et.type, et.manufacturing_stage_id
      FROM employee_tasks et
      WHERE et.type = 'production_stage' AND (et.manufacturing_stage_id IS NULL OR et.manufacturing_stage_id = 0)
      LIMIT 100
    `);

    console.log(`Found ${existingTasks.length} tasks to backfill`);

    let backfillCount = 0;
    let skipCount = 0;

    for (const task of existingTasks) {
      try {
        const planIdMatch = task.notes?.match(/Production Plan ID: (\d+)/);
        if (!planIdMatch) {
          skipCount++;
          continue;
        }

        const planId = planIdMatch[1];
        
        const [stages] = await connection.execute(`
          SELECT ms.id
          FROM manufacturing_stages ms
          JOIN production_plans pp ON ms.root_card_id = pp.root_card_id
          WHERE pp.id = ? 
          AND ms.assigned_worker = ?
          LIMIT 1
        `, [planId, task.employee_id]);

        if (stages.length > 0) {
          await connection.execute(
            'UPDATE employee_tasks SET manufacturing_stage_id = ? WHERE id = ?',
            [stages[0].id, task.id]
          );
          backfillCount++;
          console.log(`✓ Task ${task.id}: Updated with manufacturing_stage_id ${stages[0].id}`);
        } else {
          console.log(`⚠️  Task ${task.id}: No matching manufacturing stage found for plan ${planId}, employee ${task.employee_id}`);
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
