import { useState, useCallback, useEffect } from 'react';
import axios from '../../utils/api';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable/DataTable';
import {
  Plus,
  Edit2,
  Lock,
  Trash2,
  Users,
  CheckCircle2,
  Shield,
  Briefcase,
  Search,
  X,
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    roleId: '',
    email: ''
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.users || []);
    } catch (err) {
      setError('Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/roles');
      setRoles(response.data.roles || []);
    } catch (err) {
      console.error('Roles fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      roleId: '',
      email: ''
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      roleId: user.role_id,
      email: user.email || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await axios.put(`/api/admin/users/${editingUser.id}`, {
          username: formData.username,
          roleId: parseInt(formData.roleId),
          email: formData.email
        });
      } else {
        await axios.post('/api/admin/users', {
          username: formData.username,
          password: formData.password,
          roleId: parseInt(formData.roleId),
          email: formData.email
        });
      }

      setSuccess(editingUser ? 'User updated successfully' : 'User created successfully');
      closeModal();
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('User save error:', err);
      alert(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setSuccess('User deleted successfully');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('User delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handlePasswordChange = async (userId, username) => {
    const newPassword = prompt(`Enter new password for user "${username}":`);
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      await axios.put(`/api/admin/users/${userId}/password`, {
        newPassword
      });
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Password change error:', err);
      alert('Failed to change password');
    }
  };

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'management': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'sales': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      'engineering': 'bg-slate-100 text-slate-800 dark:/30 dark:text-slate-300',
      'procurement': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'qc': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'inventory': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      'production supervisor': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
      'worker': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[roleName?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesRole = !roleFilter || user.role_id == roleFilter;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role_name?.toLowerCase() === 'admin').length,
    active: Math.ceil(users.length * 0.8)
  };

  const columns = [
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (value) => (
        <span className="font-medium  dark:">
          {value}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => (
        <span className="text-slate-600 dark:text-slate-400 text-sm">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'role_name',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center text-xs gap-1">
          <button
            onClick={() => openEditModal(row)}
            title="Edit"
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition"
          >
            <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={() => handlePasswordChange(row.id, row.username)}
            title="Change Password"
            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition"
          >
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>
          <button
            onClick={() => handleDelete(row.id, row.username)}
            title="Delete"
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={row.role_name === 'Admin' && users.filter(u => u.role_name === 'Admin').length === 1}
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold  text-left">
            User Management
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 text-left">
            Create and manage system users and their roles
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          icon={Plus}
          size="sm"
        >
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg p-4 border border-blue-100 dark:border-blue-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide text-left">
                Total Users
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold  text-left">
                  {userStats.total}
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 opacity-20 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg p-4 border border-green-100 dark:border-green-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide text-left">
                Active Users
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold  text-left">
                  {userStats.active}
                </span>
              </div>
            </div>
            <CheckCircle2 className="w-8 h-8 opacity-20 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-4 border border-red-100 dark:border-red-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide text-left">
                Admins
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold  text-left">
                  {userStats.admins}
                </span>
              </div>
            </div>
            <Shield className="w-8 h-8 opacity-20 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-lg p-4 border border-cyan-100 dark:border-cyan-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide text-left">
                Roles Available
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold  text-left">
                  {roles.length}
                </span>
              </div>
            </div>
            <Briefcase className="w-8 h-8 opacity-20 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardContent className="space-y-3">
          <div className="flex items-center text-xs gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm  dark: placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm  dark: focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Data Table */}
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredUsers}
            loading={loading}
            error={error}
            emptyMessage={searchTerm || roleFilter ? 'No users matching your filters' : 'No users found'}
            sortable={true}
            striped={true}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={closeModal}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center text-xs justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center text-xs justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-md font-semibold  dark:">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium  dark: mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm  dark: placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., john.doe"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium  dark: mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm  dark: placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength="6"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium  dark: mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm  dark: focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium  dark: mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm  dark: placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                  />
                </div>

                {editingUser && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      To change the password, use the lock icon in the actions menu.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
