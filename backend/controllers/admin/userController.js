const User = require('../../models/User');
const Role = require('../../models/Role');

// Get all users with pagination
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // For now, get all users (we'll implement pagination later)
    const users = await User.findAll();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: users.length,
        pages: Math.ceil(users.length / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, password, roleId, email } = req.body;

    if (!username || !password || !roleId) {
      return res.status(400).json({
        message: 'Username, password, and role are required'
      });
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

    // Log the action
    // await AuditLog.create({
    //   user_id: req.user.id,
    //   action: 'CREATE_USER',
    //   table_name: 'users',
    //   record_id: userId
    // });

    res.status(201).json({
      message: 'User created successfully',
      userId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, roleId, email } = req.body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is taken by another user
    if (username && username !== existingUser.username) {
      const userWithUsername = await User.findByUsername(username);
      if (userWithUsername) {
        return res.status(409).json({ message: 'Username already exists' });
      }
    }

    // Verify role exists if provided
    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Invalid role' });
      }
    }

    await User.update(id, username || existingUser.username, roleId || existingUser.role_id, email);

    // Log the action
    // await AuditLog.create({
    //   user_id: req.user.id,
    //   action: 'UPDATE_USER',
    //   table_name: 'users',
    //   record_id: id
    // });

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.delete(id);

    // Log the action
    // await AuditLog.create({
    //   user_id: req.user.id,
    //   action: 'DELETE_USER',
    //   table_name: 'users',
    //   record_id: id
    // });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.updatePassword(id, newPassword);

    // Log the action
    // await AuditLog.create({
    //   user_id: req.user.id,
    //   action: 'CHANGE_PASSWORD',
    //   table_name: 'users',
    //   record_id: id
    // });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};