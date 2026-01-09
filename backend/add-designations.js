require('dotenv').config();
const pool = require('./config/database');

async function addDesignationsTable() {
  try {
    console.log('Adding designations table...\n');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS designations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Designations table created successfully!');

    console.log('\nAdding default designations...\n');

    const defaultDesignations = [
      { name: 'Manager', description: 'Management role' },
      { name: 'Senior Engineer', description: 'Senior engineering position' },
      { name: 'Engineer', description: 'Engineering position' },
      { name: 'Supervisor', description: 'Supervisory role' },
      { name: 'Associate', description: 'Associate position' },
      { name: 'Intern', description: 'Internship position' },
      { name: 'Coordinator', description: 'Coordination role' }
    ];

    for (const designation of defaultDesignations) {
      try {
        const [existing] = await pool.execute(
          'SELECT id FROM designations WHERE name = ?',
          [designation.name]
        );

        if (existing.length > 0) {
          console.log(`✓ Designation '${designation.name}' already exists`);
        } else {
          await pool.execute(
            'INSERT INTO designations (name, description, status) VALUES (?, ?, ?)',
            [designation.name, designation.description, 'active']
          );
          console.log(`✅ Added designation: ${designation.name}`);
        }
      } catch (err) {
        console.error(`❌ Error adding ${designation.name}:`, err.message);
      }
    }

    console.log('\n✅ All designations processed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addDesignationsTable();
