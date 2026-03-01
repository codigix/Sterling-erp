const pool = require('./config/database');
require('dotenv').config();

async function addMissingDepartments() {
  try {
    console.log('Adding missing departments...\n');

    const departmentsToAdd = [
      { name: 'Admin', code: 'ADM', description: 'Administrative Department' },
      { name: 'Design Engineering', code: 'DE', description: 'Design Engineering Department' },
      { name: 'Inventory', code: 'INV', description: 'Inventory Management Department' },
      { name: 'Production', code: 'PROD', description: 'Production Department' }
    ];

    for (const dept of departmentsToAdd) {
      try {
        const [existing] = await pool.execute(
          'SELECT id FROM departments WHERE name = ?',
          [dept.name]
        );

        if (existing.length > 0) {
          console.log(`✓ Department '${dept.name}' already exists`);
        } else {
          await pool.execute(
            'INSERT INTO departments (name, code, description, status) VALUES (?, ?, ?, ?)',
            [dept.name, dept.code, dept.description, 'active']
          );
          console.log(`✅ Added department: ${dept.name}`);
        }
      } catch (err) {
        console.error(`❌ Error adding ${dept.name}:`, err.message);
      }
    }

    console.log('\n✅ All departments processed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMissingDepartments();
