import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  LogOut,
  Lock,
  Edit,
  Activity,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const auditLogs = [
    {
      id: 1,
      user: 'John Doe',
      action: 'Login',
      type: 'auth',
      details: 'User logged in successfully',
      timestamp: '2025-12-13 10:30:45',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'Data Export',
      type: 'export',
      details: 'Exported employee data to CSV',
      timestamp: '2025-12-13 10:25:30',
      ipAddress: '192.168.1.105',
      status: 'success',
    },
    {
      id: 3,
      user: 'Bob Wilson',
      action: 'Failed Login',
      type: 'auth',
      details: 'Invalid credentials - 3 attempts',
      timestamp: '2025-12-13 10:20:15',
      ipAddress: '192.168.1.110',
      status: 'warning',
    },
    {
      id: 4,
      user: 'Alice Johnson',
      action: 'Role Updated',
      type: 'admin',
      details: 'Updated user role from Editor to Admin',
      timestamp: '2025-12-13 10:15:00',
      ipAddress: '192.168.1.115',
      status: 'success',
    },
    {
      id: 5,
      user: 'Charlie Brown',
      action: 'Logout',
      type: 'auth',
      details: 'User logged out',
      timestamp: '2025-12-13 10:10:20',
      ipAddress: '192.168.1.120',
      status: 'success',
    },
    {
      id: 6,
      user: 'Diana Prince',
      action: 'Permission Denied',
      type: 'security',
      details: 'Attempted unauthorized access to admin panel',
      timestamp: '2025-12-13 10:05:45',
      ipAddress: '192.168.1.125',
      status: 'error',
    },
    {
      id: 7,
      user: 'Eve Taylor',
      action: 'Password Changed',
      type: 'account',
      details: 'User password was successfully updated',
      timestamp: '2025-12-13 09:55:30',
      ipAddress: '192.168.1.130',
      status: 'success',
    },
    {
      id: 8,
      user: 'Frank Miller',
      action: 'API Key Generated',
      type: 'account',
      details: 'New API key created for third-party integration',
      timestamp: '2025-12-13 09:45:15',
      ipAddress: '192.168.1.135',
      status: 'success',
    },
  ];

  const stats = [
    { label: 'Total Logs', value: auditLogs.length, icon: Activity, color: 'blue' },
    { label: 'Successful', value: auditLogs.filter(l => l.status === 'success').length, icon: CheckCircle2, color: 'emerald' },
    { label: 'Warnings', value: auditLogs.filter(l => l.status === 'warning').length, icon: AlertTriangle, color: 'amber' },
    { label: 'Errors', value: auditLogs.filter(l => l.status === 'error').length, icon: Trash2, color: 'red' },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'auth':
        return <LogOut className="w-4 h-4" />;
      case 'export':
        return <Download className="w-4 h-4" />;
      case 'admin':
        return <Lock className="w-4 h-4" />;
      case 'account':
        return <User className="w-4 h-4" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'auth':
        return 'bg-blue-100 text-blue-700';
      case 'export':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-cyan-100 text-cyan-700';
      case 'account':
        return 'bg-indigo-100 text-indigo-700';
      case 'security':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="w-full min-h-screen bg-white space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold ">Audit Logs</h1>
          <p className="text-sm text-slate-600 mt-1 text-left">
            Track and monitor all system activities and user actions
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-xs gap-2 transition-colors">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorBg = { blue: 'bg-blue-50', emerald: 'bg-emerald-50', amber: 'bg-amber-50', red: 'bg-red-50' }[stat.color];
          const colorIcon = { blue: 'text-blue-600', emerald: 'text-emerald-600', amber: 'text-amber-600', red: 'text-red-600' }[stat.color];
          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow border border-slate-100">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold ">{stat.value}</p>
                  </div>
                  <div className={`${colorBg} p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colorIcon}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card className="hover:shadow-lg transition-shadow border border-slate-100">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by user, action, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Activity Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="auth">Authentication</option>
                <option value="export">Export</option>
                <option value="admin">Admin</option>
                <option value="account">Account</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="hover:shadow-lg transition-shadow border border-slate-100">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center text-xs gap-2 text-lg">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span>Activity Logs</span>
            <span className="text-sm font-normal text-slate-500 ml-auto">{filteredLogs.length} entries</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-2 text-left font-semibold text-slate-700">User</th>
                  <th className="p-2 text-left font-semibold text-slate-700">Action</th>
                  <th className="p-2 text-left font-semibold text-slate-700">Type</th>
                  <th className="p-2 text-left font-semibold text-slate-700">Details</th>
                  <th className="p-2 text-left font-semibold text-slate-700">Timestamp</th>
                  <th className="p-2 text-left font-semibold text-slate-700">IP Address</th>
                  <th className="p-2 text-left font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-2 font-medium ">{log.user}</td>
                      <td className="p-2 text-slate-700">{log.action}</td>
                      <td className="p-2">
                        <div className="flex items-center text-xs gap-2">
                          <div className={`p-2 rounded-lg ${getTypeColor(log.type)}`}>
                            {getTypeIcon(log.type)}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(log.type)}`}>
                            {log.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 text-slate-700 max-w-xs truncate" title={log.details}>{log.details}</td>
                      <td className="p-2 text-slate-700">{log.timestamp}</td>
                      <td className="p-2 text-slate-700 font-mono text-xs">{log.ipAddress}</td>
                      <td className="p-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                          {log.status === 'success' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                          {log.status === 'warning' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                          {log.status === 'error' && <Trash2 className="w-3 h-3 inline mr-1" />}
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      No audit logs found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
