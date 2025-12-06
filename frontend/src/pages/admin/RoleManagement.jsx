import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
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

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/admin/roles');
      setRoles(response.data.roles);
    } catch (err) {
      console.error('Roles fetch error:', err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get('/api/admin/permissions');
      setPermissions(response.data.permissions);
    } catch (err) {
      console.error('Permissions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePermissionChange = (permissionId, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const handleSelectAllPermissions = (checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked ? permissions.map(p => p.id) : []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingRole) {
        await axios.put(`/api/admin/roles/${editingRole.id}`, formData);
      } else {
        await axios.post('/api/admin/roles', formData);
      }

      closeModal();
      fetchRoles();
    } catch (err) {
      console.error('Role save error:', err);
      alert(err.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDelete = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete role "${roleName}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/roles/${roleId}`);
      fetchRoles();
    } catch (err) {
      console.error('Role delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete role');
    }
  };

  const getPermissionName = (permissionId) => {
    const permission = permissions.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
  };

  const getRoleColors = () => {
    return [
      { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-300', icon: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800' },
      { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-300', icon: 'text-green-600 dark:text-green-400', gradient: 'from-green-100 to-green-50 dark:from-green-900 dark:to-green-800' },
      { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-300', icon: 'text-red-600 dark:text-red-400', gradient: 'from-red-100 to-red-50 dark:from-red-900 dark:to-red-800' },
      { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-800 dark:text-amber-300', icon: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-100 to-amber-50 dark:from-amber-900 dark:to-amber-800' },
      { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-800 dark:text-cyan-300', icon: 'text-cyan-600 dark:text-cyan-400', gradient: 'from-cyan-100 to-cyan-50 dark:from-cyan-900 dark:to-cyan-800' },
      { bg: 'bg-violet-100 dark:bg-violet-900', text: 'text-violet-800 dark:text-violet-300', icon: 'text-violet-600 dark:text-violet-400', gradient: 'from-violet-100 to-violet-50 dark:from-violet-900 dark:to-violet-800' }
    ];
  };

  const getRoleColor = (index) => {
    const colors = getRoleColors();
    return colors[index % colors.length];
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

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const roleStats = {
    total: roles.length,
    withUsers: roles.filter(r => r.userCount > 0).length,
    avgPermissions: roles.length > 0 ? Math.round(roles.reduce((sum, r) => sum + (r.permissions?.length || 0), 0) / roles.length) : 0
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading roles...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Role Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Create roles and assign permissions for access control</p>
          </div>
          <button 
            onClick={openCreateModal} 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-2"
          >
            <i className="mdi mdi-plus"></i>Create Role
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Roles</p>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{roleStats.total}</h5>
              </div>
              <span className="text-2xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                <i className="mdi mdi-briefcase"></i>
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Roles with Users</p>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{roleStats.withUsers}</h5>
              </div>
              <span className="text-2xl bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 p-2 rounded-lg">
                <i className="mdi mdi-account-multiple"></i>
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Permissions</p>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{roleStats.avgPermissions}</h5>
              </div>
              <span className="text-2xl bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 p-2 rounded-lg">
                <i className="mdi mdi-lock-multiple"></i>
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Permissions</p>
                <h5 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{permissions.length}</h5>
              </div>
              <span className="text-2xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 p-2 rounded-lg">
                <i className="mdi mdi-shield-check"></i>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <i className="mdi mdi-magnify absolute left-3 top-3 text-gray-500"></i>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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

        {filteredRoles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <i className="mdi mdi-briefcase-search text-4xl text-gray-400 mb-4"></i>
            <h5 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">No roles found</h5>
            <p className="text-gray-600 dark:text-gray-400">{searchTerm ? 'Try adjusting your search' : 'Get started by creating your first role'}</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Role Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Users</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Permissions</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Created</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredRoles.map((role, index) => (
                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${getRoleColor(index).bg} text-white rounded-full flex items-center justify-center font-semibold text-sm ${getRoleColor(index).icon}`}>
                            {role.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {role.description || <span className="text-gray-500 dark:text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded text-sm font-medium">
                          {role.userCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions?.slice(0, 2).map((permId) => (
                            <span key={permId} className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                              {getPermissionName(permId)}
                            </span>
                          ))}
                          {role.permissions?.length > 2 && (
                            <span className="inline-block px-2 py-1 bg-gray-500 text-white rounded text-xs font-medium">
                              +{role.permissions.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(role.created_at)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(role)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition"
                            title="Edit Role"
                          >
                            <i className="mdi mdi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(role.id, role.name)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Role"
                            disabled={role.userCount > 0}
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
            {filteredRoles.map((role, index) => {
              const color = getRoleColor(index);
              return (
                <div key={role.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  <div className={`bg-gradient-to-br ${color.gradient} p-4`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h6 className={`font-bold text-lg ${color.text}`}>{role.name}</h6>
                        {role.description && (
                          <p className={`text-xs ${color.text} opacity-80 mt-1`}>{role.description}</p>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${color.text}`}>#{role.id}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Users</p>
                        <h6 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{role.userCount || 0}</h6>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Permissions</p>
                        <h6 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{role.permissions?.length || 0}</h6>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Created</p>
                        <h6 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{new Date(role.created_at).getFullYear()}</h6>
                      </div>
                    </div>
                    {role.permissions?.length > 0 ? (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permId) => (
                            <span key={permId} className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                              {getPermissionName(permId)}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-500 text-white rounded text-xs font-medium">
                              +{role.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">No permissions assigned</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(role)}
                        className={`flex-1 py-2 px-3 ${color.bg} ${color.text} rounded-lg text-sm font-medium transition hover:opacity-90 flex items-center justify-center gap-1`}
                      >
                        <i className="mdi mdi-pencil"></i>Edit
                      </button>
                      <button
                        onClick={() => handleDelete(role.id, role.name)}
                        className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={role.userCount > 0}
                      >
                        <i className="mdi mdi-delete"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                    <i className={`mdi ${editingRole ? 'mdi-briefcase-edit' : 'mdi-briefcase-plus'}`}></i>
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {editingRole ? `Role: ${editingRole.name}` : 'Define a new role with specific permissions'}
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
                        Role Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <i className="mdi mdi-briefcase absolute left-3 top-3 text-gray-400"></i>
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Manager"
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Unique role identifier</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Description</label>
                      <div className="relative">
                        <i className="mdi mdi-text absolute left-3 top-3 text-gray-400"></i>
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="What this role does..."
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Optional description of role purpose</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">Permissions</label>
                      {permissions.length > 0 && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.length === permissions.length}
                            onChange={(e) => handleSelectAllPermissions(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-500"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Select all</span>
                        </label>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      {permissions.length > 0 ? (
                        permissions.map((permission) => (
                          <label key={permission.id} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.id)}
                              onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-blue-500 mt-0.5 flex-shrink-0"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{permission.name}</span>
                              {permission.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{permission.description}</p>
                              )}
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="col-span-2 text-center text-gray-600 dark:text-gray-400 py-4">No permissions available</p>
                      )}
                    </div>
                  </div>

                  {editingRole && editingRole.userCount > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4 flex gap-3">
                      <i className="mdi mdi-alert-circle text-lg text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"></i>
                      <div className="text-sm text-amber-800 dark:text-amber-300">
                        <strong>Warning:</strong> This role is assigned to {editingRole.userCount} user(s). Changes will affect them immediately.
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
                    <i className={`mdi ${editingRole ? 'mdi-check-circle' : 'mdi-content-save'}`}></i>
                    {editingRole ? 'Update Role' : 'Create Role'}
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

export default RoleManagement;
