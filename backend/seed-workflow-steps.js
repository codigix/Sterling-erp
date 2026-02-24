const pool = require('./config/database');
require('dotenv').config();

async function seedWorkflowSteps() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🌱 Seeding design workflow steps...\n');

    const workflowSteps = [
      {
        step_name: 'Approve Designs',
        step_order: 1,
        description: 'Review and approve technical designs and 3D CAD drawings',
        task_template_title: 'Approve Designs',
        task_template_description: 'Review and approve technical designs and 3D CAD drawings for this root card',
        priority: 'high'
      },
      {
        step_name: 'Approve Documents',
        step_order: 2,
        description: 'Review and approve all supporting documents and specifications',
        task_template_title: 'Approve Documents',
        task_template_description: 'Review and approve all documents and drawings uploaded for this root card',
        priority: 'high'
      },
      {
        step_name: 'Create BOM',
        step_order: 3,
        description: 'Create the Bill of Materials for the finished good',
        task_template_title: 'Create BOM',
        task_template_description: 'Create the Bill of Materials for the finished good associated with this root card',
        priority: 'high'
      },
      {
        step_name: 'Send BOM to Admin',
        step_order: 4,
        description: 'Finalize and send the created BOM to admin for processing',
        task_template_title: 'Send BOM of finish good to admin',
        task_template_description: 'After creating and validating the BOM, send it to the admin for final review and processing',
        priority: 'medium'
      }
    ];

    for (const step of workflowSteps) {
      try {
        // Check if step already exists
        const [existing] = await connection.execute(
          'SELECT id FROM design_workflow_steps WHERE step_order = ?',
          [step.step_order]
        );

        if (existing.length > 0) {
          console.log(`⏭️  Step ${step.step_order}: ${step.step_name} already exists`);
          continue;
        }

        await connection.execute(
          `INSERT INTO design_workflow_steps 
           (step_name, step_order, description, task_template_title, task_template_description, auto_create_on_trigger, priority, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
          [
            step.step_name,
            step.step_order,
            step.description,
            step.task_template_title,
            step.task_template_description,
            step.auto_create_on_trigger,
            step.priority
          ]
        );

        console.log(`✅ Step ${step.step_order}: ${step.step_name}`);
      } catch (err) {
        console.error(`❌ Error creating step ${step.step_order}:`, err.message);
      }
    }

    // Verify seeding
    const [results] = await connection.execute(
      'SELECT COUNT(*) as count FROM design_workflow_steps WHERE is_active = TRUE'
    );

    console.log(`\n✅ Workflow seeding completed!`);
    console.log(`📊 Total active steps: ${results[0].count}`);

  } catch (err) {
    console.error('❌ Workflow seeding failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedWorkflowSteps();
