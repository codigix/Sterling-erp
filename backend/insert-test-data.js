const pool = require('./config/database');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function insertTestData() {
  try {
    console.log('Inserting test data...');

    const [users] = await pool.execute(
      `SELECT id FROM users LIMIT 1`
    );
    const userId = users[0]?.id || 1;

    const [projects] = await pool.execute(
      `SELECT id FROM projects LIMIT 1`
    );
    const projectId = projects[0]?.id || 1;

    const [rootCards] = await pool.execute(
      `SELECT id FROM root_cards LIMIT 1`
    );
    const rootCardId = rootCards[0]?.id || 1;

    const stages = [
      { name: 'Assembly', rootCardId },
      { name: 'Fabrication', rootCardId }
    ];

    for (const stage of stages) {
      const [stageResult] = await pool.execute(
        `INSERT INTO production_plan_stages 
         (production_plan_id, stage_name, stage_type, status, planned_start_date, planned_end_date)
         VALUES (?, ?, 'outsource', 'pending', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY))`,
        [rootCardId, stage.name]
      );
      const stageId = stageResult.insertId;
      console.log(`✓ Created outsource stage: ${stage.name} (ID: ${stageId})`);

      await pool.execute(
        `INSERT INTO outsourcing_tasks 
         (production_plan_stage_id, production_plan_id, project_id, root_card_id, product_name, status, assigned_department, created_by)
         VALUES (?, ?, ?, ?, ?, 'pending', 'Production', ?)`,
        [stageId, rootCardId, projectId, rootCardId, `${stage.name} Task`, userId]
      );
      console.log(`✓ Created outsourcing task for: ${stage.name}`);
    }

    console.log('\nTest data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting test data:', error);
    process.exit(1);
  }
}

insertTestData();
