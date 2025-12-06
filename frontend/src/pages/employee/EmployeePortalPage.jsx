import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import '../../styles/TaskPage.css';

const EmployeePortalPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const employeeId = localStorage.getItem('userId');

  useEffect(() => {
    fetchEmployeeTasks();
    fetchEmployeeStats();
    fetchAlerts();
  }, [employeeId, filterStatus, filterDate]);

  const fetchEmployeeTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/production/stage-tasks/employee/${employeeId}`, {
        params: {
          status: filterStatus !== 'all' ? filterStatus : undefined,
          dateFilter: filterDate !== 'all' ? filterDate : undefined
        }
      });
      setTasks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeStats = async () => {
    try {
      const response = await axios.get(`/api/production/stage-tasks/employee/${employeeId}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`/api/alerts/user/${employeeId}`, {
        params: { limit: 10 }
      });
      setAlerts(response.data);

      const unreadResponse = await axios.get(`/api/alerts/user/${employeeId}/unread-count`);
      setUnreadAlerts(unreadResponse.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const payload = {
        status,
        cancelReason: status === 'cancel' ? cancelReason : undefined
      };

      await axios.patch(`/api/production/stage-tasks/${taskId}/status`, payload);

      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
      setShowModal(false);
      setSelectedTask(null);
      setCancelReason('');

      await fetchEmployeeStats();
      await fetchAlerts();
    } catch (err) {
      setError('Failed to update task status');
      console.error(err);
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'to_do': 'warning',
      'in_progress': 'info',
      'pause': 'secondary',
      'done': 'success',
      'cancel': 'danger'
    };
    return statusColors[status] || 'secondary';
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      'high': 'danger',
      'medium': 'warning',
      'low': 'success'
    };
    return priorityColors[priority] || 'secondary';
  };

  const statusOptions = ['to_do', 'in_progress', 'pause', 'done', 'cancel'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Employee Portal</h1>
          <p>Manage your assigned tasks and track progress</p>
        </div>
        <div className="header-actions">
          <button className="alert-bell">
            🔔 <span className="alert-count">{unreadAlerts}</span>
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <Card title="Total Tasks" value={stats.total_tasks || 0} icon="📋" />
        <Card title="To Do" value={stats.to_do || 0} icon="📝" />
        <Card title="In Progress" value={stats.in_progress || 0} icon="⚙️" />
        <Card title="Completed" value={stats.completed || 0} icon="✅" />
        <Card title="Paused" value={stats.paused || 0} icon="⏸️" />
        <Card title="Cancelled" value={stats.cancelled || 0} icon="❌" />
      </div>

      <Card className="content-card">
        <div className="card-header">
          <h2>My Tasks</h2>
          <div className="filter-controls">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="pause">Paused</option>
              <option value="done">Done</option>
              <option value="cancel">Cancelled</option>
            </select>
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="filter-select">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks assigned yet</p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <div className="task-header">
                    <h3>{task.task_name}</h3>
                    <div className="task-badges">
                      <Badge type={getStatusColor(task.status)} text={task.status.replace('_', ' ').toUpperCase()} />
                      <Badge type={getPriorityColor(task.priority)} text={task.priority.toUpperCase()} />
                    </div>
                  </div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta">
                    <span>📍 {task.stage_name}</span>
                    <span>📦 {task.plan_name}</span>
                    {task.pause_count > 0 && <span>⏸️ Paused {task.pause_count}x</span>}
                  </div>
                </div>
                <Button
                  text="Update Status"
                  variant="primary"
                  size="sm"
                  onClick={() => openTaskModal(task)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {alerts.length > 0 && (
        <Card className="content-card" title="Recent Alerts">
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${!alert.is_read ? 'unread' : ''}`}>
                <div className="alert-content">
                  <h4>{alert.alert_type.replace('_', ' ').toUpperCase()}</h4>
                  <p>{alert.message}</p>
                  <small>{new Date(alert.created_at).toLocaleString()}</small>
                </div>
                <Badge type={alert.priority === 'high' ? 'danger' : alert.priority === 'medium' ? 'warning' : 'success'} text={alert.priority.toUpperCase()} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {showModal && selectedTask && (
        <Modal
          title="Update Task Status"
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
            setCancelReason('');
          }}
        >
          <div className="modal-content">
            <div className="form-group">
              <label>Current Status: <strong>{selectedTask.status.replace('_', ' ').toUpperCase()}</strong></label>
            </div>
            <div className="form-group">
              <label>Change Status To:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-control"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {newStatus === 'cancel' && (
              <div className="form-group">
                <label>Cancellation Reason:</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-control"
                  placeholder="Please provide a reason for cancellation"
                  rows="3"
                />
              </div>
            )}

            <div className="modal-actions">
              <Button
                text="Update"
                variant="primary"
                onClick={() => handleStatusChange(selectedTask.id, newStatus)}
              />
              <Button
                text="Cancel"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTask(null);
                  setCancelReason('');
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmployeePortalPage;
