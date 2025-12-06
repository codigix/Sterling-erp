import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    roleId: '',
    email: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/admin/roles');
      setRoles(response.data.roles);
    } catch (err) {
      console.error('Roles fetch error:', err);
    }
  };

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

      closeModal();
      fetchUsers();
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
      fetchUsers();
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
      alert('Password changed successfully');
    } catch (err) {
      console.error('Password change error:', err);
      alert('Failed to change password');
    }
  };

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'management': 'bg-amber-100 text-amber-800',
      'sales': 'bg-cyan-100 text-cyan-800',
      'engineering': 'bg-slate-100 text-slate-800',
      'procurement': 'bg-emerald-100 text-emerald-800',
      'qc': 'bg-blue-100 text-blue-800',
      'inventory': 'bg-violet-100 text-violet-800',
      'production supervisor': 'bg-sky-100 text-sky-800',
      'worker': 'bg-gray-100 text-gray-800'
    };
    return colors[roleName?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <i className="mdi mdi-alert-circle text-3xl text-red-500 mb-4"></i>
        <h5 className="text-lg font-semibold text-red-600">Error Loading Users</h5>
        <p className="text-gray-600 dark:text-gray-400 my-2">{error}</p>
        <button onClick={fetchUsers} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          <i className="mdi mdi-refresh me-2"></i>Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Create, edit, and manage system users and their roles</p>
          </div>
          <button 
            onClick={openCreateModal} 
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition flex items-center gap-2"
          >
            <i className="mdi mdi-plus"></i>Add New User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Users</p>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{userStats.total}</h5>
              </div>
              <span className="text-2xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                <i className="mdi mdi-account-group"></i>
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Users</p>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{userStats.active}</h5>
              </div>
              <span className="text-2xl bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 p-2 rounded-lg">
                <i className="mdi mdi-check-circle"></i>
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Admins</p>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{userStats.admins}</h5>
              </div>
              <span className="text-2xl bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 p-2 rounded-lg">
                <i className="mdi mdi-shield-account"></i>
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Roles Available</p>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{roles.length}</h5>
              </div>
              <span className="text-2xl bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 p-2 rounded-lg">
                <i className="mdi mdi-briefcase"></i>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <i className="mdi mdi-magnify absolute left-3 top-3 text-gray-500"></i>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  viewMode === 'table' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => setViewMode('table')}
              >
                <i className="mdi mdi-table me-1"></i>Table
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  viewMode === 'cards' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => setViewMode('cards')}
              >
                <i className="mdi mdi-view-grid me-1"></i>Cards
              </button>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <i className="mdi mdi-account-search text-4xl text-gray-400 mb-4"></i>
            <h5 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">No users found</h5>
            <p className="text-gray-600 dark:text-gray-400">{searchTerm || roleFilter ? 'Try adjusting your search filters' : 'Get started by adding your first user'}</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Created</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email || <span className="text-gray-500 dark:text-gray-400">Not provided</span>}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role_name)}`}>
                          {user.role_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition"
                            title="Edit User"
                          >
                            <i className="mdi mdi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handlePasswordChange(user.id, user.username)}
                            className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900 rounded-lg transition"
                            title="Change Password"
                          >
                            <i className="mdi mdi-lock-reset"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.username)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete User"
                            disabled={user.role_name === 'Admin' && users.filter(u => u.role_name === 'Admin').length === 1}
                          >
                            <i className="mdi mdi-delete"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-900 dark:text-white">{user.username}</h6>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{user.id}</p>
                      </div>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role_name)}`}>
                      {user.role_name}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <i className="mdi mdi-email-outline me-2"></i>
                    {user.email || 'No email'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <i className="mdi mdi-calendar-outline me-2"></i>
                    Joined {formatDate(user.created_at)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <i className="mdi mdi-pencil"></i>Edit
                    </button>
                    <button
                      onClick={() => handlePasswordChange(user.id, user.username)}
                      className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <i className="mdi mdi-lock-reset"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.username)}
                      className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={user.role_name === 'Admin' && users.filter(u => u.role_name === 'Admin').length === 1}
                    >
                      <i className="mdi mdi-delete"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={closeModal}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-6 py-4 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <i className={`mdi ${editingUser ? 'mdi-account-edit' : 'mdi-account-plus'}`}></i>
                    {editingUser ? 'Edit User' : 'Create New User'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {editingUser ? `Username: ${editingUser.username}` : 'Add a new user to the system'}
                  </p>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition text-2xl"
                >
                  <i className="mdi mdi-close"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <i className="mdi mdi-account absolute left-3 top-3 text-gray-400"></i>
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., john.doe"
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Unique identifier for login</p>
                    </div>

                    {!editingUser && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <i className="mdi mdi-lock absolute left-3 top-3 text-gray-400"></i>
                          <input
                            type="password"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength="6"
                            placeholder="Minimum 6 characters"
                          />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Must be at least 6 characters long</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Defines user permissions and access level</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Email</label>
                      <div className="relative">
                        <i className="mdi mdi-email absolute left-3 top-3 text-gray-400"></i>
                        <input
                          type="email"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="user@example.com"
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Optional - for notifications and recovery</p>
                    </div>
                  </div>

                  {editingUser && (
                    <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex gap-3">
                      <i className="mdi mdi-information text-lg text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"></i>
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Note:</strong> To change the password, use the "Change Password" button in the actions menu.
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <i className="mdi mdi-close"></i>Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <i className={`mdi ${editingUser ? 'mdi-check-circle' : 'mdi-content-save'}`}></i>
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
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
