import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable/DataTable';
import {
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  Users,
  Lock,
  Shield,
  Search,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions] = useState([
    { id: 1, name: 'Manage Users', description: 'Create, edit, delete users' },
    { id: 2, name: 'Manage Roles', description: 'Create and manage system roles' },
    { id: 3, name: 'View Reports', description: 'Access all reports' },
    { id: 4, name: 'Edit Projects', description: 'Create and edit projects' },
    { id: 5, name: 'View Dashboard', description: 'Access dashboard' },
    { id: 6, name: 'Submit Tasks', description: 'Submit tasks and updates' },
    { id: 7, name: 'System Settings', description: 'Configure system settings' },
    { id: 8, name: 'Audit Logs', description: 'View system audit logs' }
  ]);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const initialRoles = [
    {
      id: 1,
      name: 'Admin',
      description: 'Full system access',
      userCount: 2,
      permissions: [1, 2, 3, 4, 5, 6, 7, 8],
      is_active: true,
      created_at: '2025-01-01'
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Management access',
      userCount: 5,
      permissions: [2, 3, 4, 5],
      is_active: true,
      created_at: '2025-01-05'
    },
    {
      id: 3,
      name: 'Supervisor',
      description: 'Team supervision',
      userCount: 8,
      permissions: [3, 4, 5],
      is_active: true,
      created_at: '2025-01-10'
    },
    {
      id: 4,
      name: 'Employee',
      description: 'Regular employee access',
      userCount: 50,
      permissions: [5, 6],
      is_active: true,
      created_at: '2025-01-15'
    }
  ];

  useEffect(() => {
    setRoles(initialRoles);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Role name is required');
      return;
    }

    let updatedRoles;
    if (editingRole) {
      updatedRoles = roles.map(role =>
        role.id === editingRole.id
          ? { ...role, ...formData }
          : role
      );
      setSuccess('Role updated successfully');
    } else {
      const newRole = {
        id: Math.max(...roles.map(r => r.id), 0) + 1,
        ...formData,
        userCount: 0,
        is_active: true,
        created_at: new Date().toISOString().split('T')[0]
      };
      updatedRoles = [...roles, newRole];
      setSuccess('Role created successfully');
    }

    setRoles(updatedRoles);
    closeModal();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDelete = (roleId, roleName) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.userCount > 0) {
      alert(`Cannot delete role "${roleName}" because it has ${role.userCount} users assigned`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete role "${roleName}"?`)) {
      return;
    }

    setRoles(roles.filter(r => r.id !== roleId));
    setSuccess('Role deleted successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleToggleRoleStatus = (roleId, currentStatus, roleName) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} role "${roleName}"?`)) {
      return;
    }

    setRoles(roles.map(role =>
      role.id === roleId ? { ...role, is_active: newStatus } : role
    ));
    setSuccess(`Role ${action}d successfully`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const getPermissionName = (permissionId) => {
    const permission = permissions.find(p => p.id === permissionId);
    return permission ? permission.name : `Permission ${permissionId}`;
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

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value) => (
        <span className="font-medium dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (value) => (
        <span className="text-slate-600 dark:text-slate-400 text-sm">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'userCount',
      label: 'Users',
      sortable: true,
      render: (value) => (
        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {value || 0}
        </span>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      sortable: false,
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((permId) => (
            <span key={permId} className="inline-block px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded text-xs">
              {getPermissionName(permId)}
            </span>
          ))}
          {value?.length > 2 && (
            <span className="inline-block px-2 py-1 bg-slate-500 text-white rounded text-xs font-medium">
              +{value.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {formatDate(value)}
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
            onClick={() => handleToggleRoleStatus(row.id, row.is_active, row.name)}
            title={row.is_active ? "Deactivate" : "Activate"}
            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition"
          >
            {row.is_active ? (
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            )}
          </button>
          <button
            onClick={() => handleDelete(row.id, row.name)}
            title="Delete"
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={row.userCount > 0}
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
          <h1 className="text-xl font-bold text-left">
            Role Management
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 text-left">
            Create and manage roles with permissions
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg p-4 border border-blue-100 dark:border-blue-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide text-left">
                Total Roles
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-left">
                  {roleStats.total}
                </span>
              </div>
            </div>
            <Briefcase className="w-8 h-8 opacity-20 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg p-4 border border-green-100 dark:border-green-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide text-left">
                Roles with Users
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-left">
                  {roleStats.withUsers}
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 opacity-20 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-lg p-4 border border-cyan-100 dark:border-cyan-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide text-left">
                Avg Permissions
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-left">
                  {roleStats.avgPermissions}
                </span>
              </div>
            </div>
            <Lock className="w-8 h-8 opacity-20 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg p-4 border border-amber-100 dark:border-amber-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide text-left">
                Permissions
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-left">
                  {permissions.length}
                </span>
              </div>
            </div>
            <Shield className="w-8 h-8 opacity-20 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <CardContent className="space-y-3">
          <div className="flex items-center text-xs gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
            data={filteredRoles}
            emptyMessage={searchTerm ? 'No roles matching your search' : 'No roles found'}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-md font-semibold dark:text-white">
                  {editingRole ? 'Edit Role' : 'Create New Role'}
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
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Role description..."
                    rows="3"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium dark:text-slate-300">
                      Permissions
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.length === permissions.length}
                        onChange={(e) => handleSelectAllPermissions(e.target.checked)}
                        className="rounded"
                      />
                      <span className="dark:text-slate-300">Select All</span>
                    </label>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto bg-slate-50 dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600">
                    {permissions.map(permission => (
                      <label key={permission.id} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                          className="mt-1 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium dark:text-white">{permission.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="secondary"
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="text-xs">
                    {editingRole ? 'Update Role' : 'Create Role'}
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

export default RoleManagement;
