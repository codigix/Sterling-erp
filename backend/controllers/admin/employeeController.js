const Employee = require('../../models/Employee');
const Role = require('../../models/Role');

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    const formattedEmployees = employees.map(emp => ({
      id: emp.id,
      firstName: emp.first_name,
      lastName: emp.last_name,
      email: emp.email,
      designation: emp.designation,
      department: emp.department,
      role: emp.role_name,
      loginId: emp.login_id,
      status: emp.status,
      actions: emp.actions || []
    }));
    res.json(formattedEmployees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    const formatted = {
      id: employee.id,
      firstName: employee.first_name,
      lastName: employee.last_name,
      email: employee.email,
      designation: employee.designation,
      department: employee.department,
      role: employee.role_name,
      loginId: employee.login_id,
      status: employee.status,
      actions: employee.actions || []
    };
    res.json(formatted);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, designation, department, roleId, loginId, password, actions } = req.body;
    
    if (!firstName || !lastName || !email || !designation || !department || !roleId || !loginId || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingByLogin = await Employee.findByLoginId(loginId);
    if (existingByLogin) {
      return res.status(409).json({ message: 'Login ID already exists' });
    }

    const existingByEmail = await Employee.findByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const id = await Employee.create({
      firstName,
      lastName,
      email,
      designation,
      department,
      roleId,
      loginId,
      password,
      actions: actions || []
    });

    res.status(201).json({ 
      message: 'Employee created successfully',
      id,
      credentials: { loginId, password }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.update(id, req.body);
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.delete(id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
