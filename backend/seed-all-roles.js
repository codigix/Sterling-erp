require('dotenv').config();
const pool = require('./config/database');

async function seedRoles() {
  try {
    console.log('Seeding all roles to database...\n');

    const rolesToAdd = [
      { name: 'Admin', description: 'Full system access' },
      { name: 'Management', description: 'Management access' },
      { name: 'Supervisor', description: 'Supervisor access' },
      { name: 'Employee', description: 'Regular employee access' },
      { name: 'Sales', description: 'Sales department access' },
      { name: 'Design Engineer', description: 'Design engineering access' },
      { name: 'Production', description: 'Production department access' },
      { name: 'QC', description: 'Quality control access' },
      { name: 'Procurement', description: 'Procurement department access' },
      { name: 'Inventory', description: 'Inventory management access' },
      { name: 'inventory_manager', description: 'Inventory manager specific role' },
      { name: 'production_manager', description: 'Production manager specific role' },
      { name: 'design_engineer', description: 'Design engineer specific role' },
      { name: 'qc_manager', description: 'QC manager specific role' }
    ];

    console.log('Checking and adding roles...\n');

    for (const role of rolesToAdd) {
      try {
        const [existing] = await pool.execute(
          'SELECT id FROM roles WHERE name = ?',
          [role.name]
        );

        if (existing.length > 0) {
          console.log(`✓ Role '${role.name}' already exists`);
        } else {
          await pool.execute(
            'INSERT INTO roles (name, permissions, is_active) VALUES (?, ?, ?)',
            [role.name, JSON.stringify([]), true]
          );
          console.log(`✅ Added role: ${role.name}`);
        }
      } catch (err) {
        console.error(`❌ Error with role '${role.name}':`, err.message);
      }
    }

    console.log('\n✅ Role seeding completed!');
    
    const [allRoles] = await pool.execute('SELECT id, name FROM roles ORDER BY id');
    console.log('\nCurrent roles in database:');
    allRoles.forEach(r => console.log(`  ${r.id}: ${r.name}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedRoles();
