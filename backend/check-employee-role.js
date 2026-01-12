const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Employee = require('./models/Employee');

async function checkProductionEmployee() {
  try {
    console.log('Checking if "production" is an Employee...\n');
    
    const employee = await Employee.findByLoginId('production');
    
    if (!employee) {
      console.log('❌ No employee found with login_id "production"');
      console.log('\nThis means production user is a regular User, not an Employee');
      process.exit(0);
    }

    console.log('Employee found:', employee);
    console.log('\nEmployee role_name:', employee?.role_name);
    console.log('Employee permissions:', employee?.permissions);
    
    if (!employee.role_name) {
      console.log('\n❌ ISSUE FOUND: Employee role_name is NULL or undefined!');
    } else {
      console.log('\n✅ Employee has role:', employee.role_name);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkProductionEmployee();
