const pool = require("./config/database");
require('dotenv').config();

(async () => {
  try {
    const [employees] = await pool.execute(
      "SELECT id, first_name, last_name, email, department_id, designation FROM employees"
    );
    console.log("Employees in database:");
    console.log(JSON.stringify(employees, null, 2));

    const [departments] = await pool.execute(
      "SELECT id, name FROM departments"
    );
    console.log("\nDepartments in database:");
    console.log(JSON.stringify(departments, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
