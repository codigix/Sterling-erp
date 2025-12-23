const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const roleMap = {
  'Admin': 'admin',
  'Management': 'management',
  'Engineering': 'engineering',
  'Worker': 'worker',
  'inventory manager': 'inventory_manager',
  'design engineer': 'design_engineer',
  'QC manager': 'qc_manager',
  'Production manager': 'production_manager',
  'Accountant ': 'accountant',
  'Sales': 'sales',
  'Procurement': 'procurement',
  'QC': 'qc',
  'Inventory': 'inventory',
  'Production': 'production',
  'MES': 'mes',
  'Challan': 'challan',
};

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'sterling_erp'
    });

    const conn = await pool.getConnection();

    console.log('Normalizing role names in database...\n');

    for (const [oldName, newName] of Object.entries(roleMap)) {
      try {
        const [result] = await conn.execute(
          'UPDATE roles SET name = ? WHERE name = ?',
          [newName, oldName]
        );
        if (result.affectedRows > 0) {
          console.log(`✓ Updated '${oldName}' → '${newName}' (${result.affectedRows} row(s))`);
        }
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') {
          console.log(`⚠ Skipped '${oldName}' → '${newName}': ${err.message}`);
        }
      }
    }

    console.log('\nVerifying updated roles...');
    const [roles] = await conn.execute('SELECT id, name FROM roles ORDER BY name');
    console.log('\nCurrent roles in database:');
    roles.forEach(role => console.log(`  - ${role.name}`));

    conn.release();
    pool.end();
    console.log('\n✅ Role normalization completed!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
