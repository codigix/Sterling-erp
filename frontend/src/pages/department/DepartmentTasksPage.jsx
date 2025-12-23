import React, { useState, useEffect } from 'react';
import axios from '@/utils/api';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { CheckCircle2, Clock, AlertCircle, Edit2, Eye, Loader2 } from 'lucide-react';

const DepartmentTasksPage = ({ departmentName }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0, on_hold: 0, critical_count: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    fetchRoleId();
  }, [departmentName]);

  useEffect(() => {
    if (roleId) {
      fetchTasks();
      fetchStats();
    }
  }, [roleId, statusFilter, priorityFilter]);

  const fetchRoleId = async () => {
    try {
      const response = await axios.get(`/api/department/portal/role/${departmentName.toLowerCase().replace(/\s+/g, '_')}`);
      setRoleId(response.data.roleId);
    } catch (error) {
      console.error('Error fetching role ID:', error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      const response = await axios.get(`/api/department/portal/tasks/${roleId}`, { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/department/portal/stats/${roleId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      on_hold: 'danger',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'danger',
      high: 'warning',
      medium: 'default',
      low: 'success',
    };
    return colors[priority] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle2 className="w-4 h-4" />,
      in_progress: <Clock className="w-4 h-4" />,
      on_hold: <AlertCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">{departmentName} Tasks</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track department tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-blue-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.in_progress || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-600">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.on_hold || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-700">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.critical_count || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Department Tasks</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage all tasks</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex-1 md:flex-none">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  containerClassName="mt-0"
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'on_hold', label: 'On Hold' },
                  ]}
                />
              </div>
              <div className="flex-1 md:flex-none">
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  containerClassName="mt-0"
                  options={[
                    { value: 'all', label: 'All Priority' },
                    { value: 'critical', label: 'Critical' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks found</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant={getStatusColor(task.status)} size="sm">
                          {task.status}
                        </Badge>
                        <Badge variant={getPriorityColor(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      </div>

                      {task.rootCard && (
                        <div className="text-xs text-gray-600 space-y-1">
                          <p><strong>Card:</strong> {task.rootCard.title}</p>
                          {task.project && <p><strong>Project:</strong> {task.project.name}</p>}
                          {task.salesOrder && <p><strong>Customer:</strong> {task.salesOrder.customer}</p>}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button variant="secondary" size="sm">View</Button>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentTasksPage;
