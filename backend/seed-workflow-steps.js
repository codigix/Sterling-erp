const pool = require('./config/database');
require('dotenv').config();

async function seedWorkflowSteps() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🌱 Seeding design workflow steps...\n');

    const workflowSteps = [
      {
        step_name: 'Verify and approve design',
        step_order: 1,
        description: 'Verify and approve all raw designs for this root card',
        task_template_title: 'Verify and approve design',
        task_template_description: 'Check raw designs at /design-engineer/documents/raw-designs and approve them.',
        priority: 'high',
        link: '/design-engineer/documents/raw-designs'
      },
      {
        step_name: 'Verify and approve the document',
        step_order: 2,
        description: 'Verify and approve all required documents for this root card',
        task_template_title: 'Verify and approve the document',
        task_template_description: 'Check required documents at /design-engineer/documents/required-docs and approve them.',
        priority: 'high',
        link: '/design-engineer/documents/required-docs'
      },
      {
        step_name: 'Create BOM',
        step_order: 3,
        description: 'Create Bill of Materials (BOM) for this root card',
        task_template_title: 'Create BOM',
        task_template_description: 'Create and validate the Bill of Materials for this root card.',
        priority: 'high',
        link: '/design-engineer/bom/create'
      },
      {
        step_name: 'Send BOM to admin',
        step_order: 4,
        description: 'Send finalized BOM to admin',
        task_template_title: 'Send BOM to admin',
        task_template_description: 'Finalize and send the BOM to admin for further processing.',
        priority: 'medium',
        link: '/design-engineer/bom/view'
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
          await connection.execute(
            `UPDATE design_workflow_steps SET 
             step_name = ?, description = ?, task_template_title = ?, task_template_description = ?, priority = ?, link = ?, is_active = TRUE 
             WHERE id = ?`,
            [step.step_name, step.description, step.task_template_title, step.task_template_description, step.priority, step.link, existing[0].id]
          );
          console.log(`✅ Updated Step ${step.step_order}: ${step.step_name}`);
          continue;
        }

        await connection.execute(
          `INSERT INTO design_workflow_steps 
           (step_name, step_order, description, task_template_title, task_template_description, priority, link, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
          [
            step.step_name,
            step.step_order,
            step.description,
            step.task_template_title,
            step.task_template_description,
            step.priority,
            step.link
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
