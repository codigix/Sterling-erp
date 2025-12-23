const Role = require('../../models/Role');
const pool = require('../../config/database');

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    
    for (const role of roles) {
      const [users] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [role.id]);
      role.userCount = users[0]?.count || 0;
    }
    
    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ role });
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new role
exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    // Check if role already exists
    const existingRole = await Role.findByName(name);
    if (existingRole) {
      return res.status(409).json({ message: 'Role already exists' });
    }

    const roleId = await Role.create(name, permissions || []);

    // Log the action
    // await AuditLog.create({
    //   user_id: req.user.id,
    //   action: 'CREATE_ROLE',
    //   table_name: 'roles',
    //   record_id: roleId
    // });

    res.status(201).json({
      message: 'Role created successfully',
      roleId
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check if name is taken by another role
    if (name && name !== existingRole.name) {
      const roleWithName = await Role.findByName(name);
      if (roleWithName) {
        return res.status(409).json({ message: 'Role name already exists' });
      }
    }

    await Role.update(id, name || existingRole.name, permissions || existingRole.permissions);

    // Log the action
    // await AuditLog.create({
    //   user_id: req.user.id,
    //   action: 'UPDATE_ROLE',
    //   table_name: 'roles',
    //   record_id: id
    // });

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent deleting system roles
    const systemRoles = ['Admin', 'Management'];
    if (systemRoles.includes(role.name)) {
      return res.status(400).json({ message: 'Cannot delete system roles' });
    }

    // Check if role is being used by users
    try {
      const [users] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [id]);
      if (users && users.length > 0 && users[0].count > 0) {
        return res.status(400).json({ message: `Cannot delete role that is assigned to ${users[0].count} users` });
      }
    } catch (err) {
      console.error('Error checking user count:', err);
    }

    await Role.delete(id);

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Set role active/inactive status
exports.setRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ message: 'is_active must be a boolean' });
    }

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent deactivating system roles
    const systemRoles = ['Admin', 'Management'];
    if (!is_active && systemRoles.includes(role.name)) {
      return res.status(400).json({ message: 'Cannot deactivate system roles' });
    }

    await Role.setActive(id, is_active);

    res.json({ 
      message: `Role ${is_active ? 'activated' : 'deactivated'} successfully`,
      role: {
        id: role.id,
        name: role.name,
        is_active: is_active
      }
    });
  } catch (error) {
    console.error('Set role status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};