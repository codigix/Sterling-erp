const pool = require('./config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function migrateWorkflow() {
  const connection = await pool.getConnection();
  try {
    console.log('Creating design_workflow_steps table...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS design_workflow_steps (
        id INT PRIMARY KEY AUTO_INCREMENT,
        step_name VARCHAR(255) NOT NULL,
        step_order INT NOT NULL,
        description TEXT,
        task_template_title VARCHAR(255) NOT NULL,
        task_template_description TEXT,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        auto_create_on_trigger VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_step_order (step_order)
      )
    `);
    console.log('✅ Table created');

    console.log('Inserting workflow steps...');
    await connection.execute(`
      INSERT IGNORE INTO design_workflow_steps (step_name, step_order, description, task_template_title, task_template_description, priority, auto_create_on_trigger, is_active) VALUES
      ('Project Details Input', 1, 'Input and verify all project specifications and requirements', 'Enter Project Details', 'Input project name, dimensions, load capacity, operating environment, and other specifications', 'high', 'root_card_created', 1),
      ('Design Document Preparation', 2, 'Create design documents including drawings and specifications', 'Prepare Design Documents', 'Create technical drawings, CAD files, and design specifications based on project requirements', 'high', 'project_details_completed', 1),
      ('BOM Creation', 3, 'Create Bill of Materials with all components and materials', 'Create and Validate BOM', 'Create comprehensive BOM listing all materials, components, and consumables required for manufacturing', 'high', 'design_documents_created', 1),
      ('Design Review & Approval', 4, 'Submit design for review and approval', 'Submit Design for Review', 'Submit completed design for review by supervisors and get approval before moving to production', 'medium', 'bom_created', 1),
      ('Pending Reviews Follow-up', 5, 'Track and follow up on designs awaiting review', 'Follow up on Pending Reviews', 'Monitor designs pending review and follow up with reviewers for timely approvals', 'medium', 'design_submitted', 1),
      ('Approved Design Documentation', 6, 'Document and archive approved designs', 'Document Approved Designs', 'Update records with approved designs and maintain design documentation for reference', 'low', 'design_approved', 1),
      ('Technical File Management', 7, 'Manage technical files and version control', 'Manage Technical Files', 'Organize and maintain technical files, specifications, and supporting documents with proper version control', 'medium', 'design_approved', 1)
    `);
    console.log('✅ Workflow steps inserted');

    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM design_workflow_steps');
    console.log(`✅ Total workflow steps: ${rows[0].count}`);
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
  }
}

migrateWorkflow();
