const pool = require("./config/database");
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedEmployees() {
  try {
    const password = await bcrypt.hash('password123', 10);
    
    const employees = [
      {
        firstName: 'Inventory',
        lastName: 'Manager',
        email: 'inventory.manager@sterling.com',
        designation: 'Manager',
        department: 'Inventory',
        departmentId: 3, // Inventory
        roleId: 9, // inventory_manager
        loginId: 'inv.manager',
        password: password
      },
      {
        firstName: 'Production',
        lastName: 'Manager',
        email: 'production.manager@sterling.com',
        designation: 'Manager',
        department: 'Production',
        departmentId: 4, // Production
        roleId: 10, // production_manager
        loginId: 'prod.manager',
        password: password
      },
      {
        firstName: 'Design',
        lastName: 'Engineer',
        email: 'design.engineer@sterling.com',
        designation: 'Engineer',
        department: 'Design Engineering',
        departmentId: 2, // Design Engineering
        roleId: 11, // design_engineer
        loginId: 'design.eng',
        password: password
      }
    ];

    for (const emp of employees) {
      const [existing] = await pool.execute('SELECT id FROM employees WHERE email = ?', [emp.email]);
      if (existing.length === 0) {
        await pool.execute(
          `INSERT INTO employees (first_name, last_name, email, designation, department, department_id, role_id, login_id, password, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
          [emp.firstName, emp.lastName, emp.email, emp.designation, emp.department, emp.departmentId, emp.roleId, emp.loginId, emp.password]
        );
        console.log(`Added employee: ${emp.firstName} ${emp.lastName}`);
      } else {
        console.log(`Employee ${emp.email} already exists`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedEmployees();
