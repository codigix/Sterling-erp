const pool = require('./config/database');

async function seedCompanyUpdates() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query('START TRANSACTION');
    
    const updates = [
      {
        title: 'Project Kickoff',
        description: 'Dashboard Redesign project officially started today. First sprint planning scheduled for tomorrow at 2 PM.',
        author: 'Project Manager',
        priority: 'high',
        category: 'Project'
      },
      {
        title: 'System Maintenance',
        description: 'Planned server maintenance tonight 11 PM - 3 AM EST. Please save your work before that time.',
        author: 'IT Admin',
        priority: 'medium',
        category: 'System'
      },
      {
        title: 'New Feature Release',
        description: 'Employee portal now includes real-time project tracking and advanced analytics features. Check it out!',
        author: 'Development Team',
        priority: 'low',
        category: 'Feature'
      },
      {
        title: 'Policy Update',
        description: 'Updated work-from-home policy is now in effect. You can WFH up to 3 days per week with manager approval.',
        author: 'HR Department',
        priority: 'high',
        category: 'Policy'
      },
      {
        title: 'Team Expansion',
        description: 'Welcoming 5 new team members to our department! Onboarding starts next Monday.',
        author: 'Department Lead',
        priority: 'medium',
        category: 'Team'
      },
      {
        title: 'Training Opportunity',
        description: "Free professional development training: 'Advanced React & Performance Optimization' - Register by Friday!",
        author: 'L&D Team',
        priority: 'low',
        category: 'Training'
      },
      {
        title: 'Q4 Results Announcement',
        description: 'Congratulations! Our company exceeded Q4 targets by 25%. All hard work is paying off!',
        author: 'Executive Board',
        priority: 'high',
        category: 'Company'
      },
      {
        title: 'New Office Space',
        description: 'We are opening a new office space in downtown to accommodate our growing team. Virtual tours available.',
        author: 'Facilities Manager',
        priority: 'medium',
        category: 'Company'
      }
    ];

    for (const update of updates) {
      await connection.execute(
        `INSERT INTO company_updates (title, description, author, priority, category, is_published, created_at)
         VALUES (?, ?, ?, ?, ?, TRUE, NOW())`,
        [update.title, update.description, update.author, update.priority, update.category]
      );
    }

    await connection.query('COMMIT');
    console.log('✅ Company updates seeded successfully');
    
  } catch (error) {
    await connection.query('ROLLBACK');
    console.error('❌ Error seeding company updates:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

seedCompanyUpdates()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
