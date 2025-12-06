const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Employee = require('../../models/Employee');
const Role = require('../../models/Role');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role_name,
      permissions: user.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    let employee = await Employee.findByLoginId(username);
    if (employee) {
      const isValidPassword = await Employee.verifyPassword(password, employee.password);
      if (isValidPassword) {
        const token = generateToken(employee);
        return res.json({
          token,
          user: {
            id: employee.id,
            username: employee.login_id,
            name: `${employee.first_name} ${employee.last_name}`,
            email: employee.email,
            role: employee.role_name,
            designation: employee.designation,
            department: employee.department,
            type: 'employee',
            permissions: employee.permissions
          }
        });
      }
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name,
        type: 'user',
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, roleId, email } = req.body;

    if (!username || !password || !roleId) {
      return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Verify role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const userId = await User.create(username, password, roleId, email);

    res.status(201).json({
      message: 'User created successfully',
      userId
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};