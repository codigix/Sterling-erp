const pool = require('./config/database');
require('dotenv').config();

async function seedWorkflowSteps() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🌱 Seeding design workflow steps...\n');

    const workflowSteps = [
      {
        step_name: 'Initial Review',
        step_order: 1,
        description: 'Review initial design requirements and documentation',
        task_template_title: 'Initial Design Review',
        task_template_description: 'Review and validate initial design requirements and project scope',
        auto_create_on_trigger: 'design_assigned',
        priority: 'high'
      },
      {
        step_name: 'BOM Analysis',
        step_order: 2,
        description: 'Analyze Bill of Materials and component specifications',
        task_template_title: 'Analyze Bill of Materials',
        task_template_description: 'Review and analyze BOM data. Ensure all components are available and specifications match design requirements',
        auto_create_on_trigger: 'bom_uploaded',
        priority: 'high'
      },
      {
        step_name: '3D Drawing Review',
        step_order: 3,
        description: 'Review 3D CAD drawings and design files',
        task_template_title: 'Review 3D Design Drawings',
        task_template_description: 'Review and validate 3D drawings and CAD files. Check dimensions, tolerances, and manufacturing feasibility',
        auto_create_on_trigger: 'drawings_uploaded',
        priority: 'high'
      },
      {
        step_name: 'Specifications Validation',
        step_order: 4,
        description: 'Validate design specifications and technical requirements',
        task_template_title: 'Validate Design Specifications',
        task_template_description: 'Validate all design specifications including materials, dimensions, tolerances, and quality standards',
        auto_create_on_trigger: 'specs_uploaded',
        priority: 'medium'
      },
      {
        step_name: 'Documentation Review',
        step_order: 5,
        description: 'Review design documentation and reference materials',
        task_template_title: 'Review Design Documentation',
        task_template_description: 'Review all uploaded design documents and ensure completeness. Check for any missing specifications or requirements',
        auto_create_on_trigger: 'docs_uploaded',
        priority: 'medium'
      },
      {
        step_name: 'Design Notes Review',
        step_order: 6,
        description: 'Review design notes and additional requirements',
        task_template_title: 'Review Design Notes & Requirements',
        task_template_description: 'Review design notes and any additional requirements provided by the client or design team',
        auto_create_on_trigger: 'notes_added',
        priority: 'medium'
      },
      {
        step_name: 'Final Approval',
        step_order: 7,
        description: 'Final approval and sign-off for design',
        task_template_title: 'Final Design Approval',
        task_template_description: 'Final review and approval of complete design package. Ready for production',
        auto_create_on_trigger: 'approval_requested',
        priority: 'critical'
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
