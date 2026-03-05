const pool = require('./backend/config/database');
(async () => {
  try {
    const [roles] = await pool.execute("SELECT id, name FROM roles WHERE name LIKE '%Inventory%'");
    console.log("Found Inventory Roles:", JSON.stringify(roles, null, 2));
    
    if (roles.length > 0) {
      const roleIds = roles.map(r => r.id);
      const placeholders = roleIds.map(() => "?").join(",");
      const [tasks] = await pool.execute(`SELECT * FROM department_tasks WHERE role_id IN (${placeholders})`, roleIds);
      console.log("Found Tasks for Inventory Roles:", JSON.stringify(tasks, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
