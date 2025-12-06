import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeePortal.css';

const EmployeePortal = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [filter, setFilter] = useState('today');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/employee/tasks', {
        params: { dateFilter: filter },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/employee/tasks/statistics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`/api/employee/tasks/${taskId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      default: return '#999';
    }
  };

  return (
    <div className="employee-portal">
      <div className="portal-header">
        <h1>Employee Task Dashboard</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#FF9800' }}>{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#2196F3' }}>{stats.in_progress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-value" style={{ color: '#4CAF50' }}>{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
          onClick={() => setFilter('today')}
        >
          Today
        </button>
        <button 
          className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
          onClick={() => setFilter('week')}
        >
          This Week
        </button>
        <button 
          className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
          onClick={() => setFilter('month')}
        >
          This Month
        </button>
      </div>

      <div className="tasks-section">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="no-tasks">No tasks found</div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h3>{task.task}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="task-meta">
                  <p><strong>Stage:</strong> {task.stage_name}</p>
                  <p><strong>Project:</strong> {task.root_card_title}</p>
                </div>
                <div className="task-actions">
                  {task.status === 'pending' && (
                    <button 
                      className="action-btn start"
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                    >
                      Start
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <>
                      <button 
                        className="action-btn complete"
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                      >
                        Complete
                      </button>
                      <button 
                        className="action-btn pause"
                        onClick={() => updateTaskStatus(task.id, 'pending')}
                      >
                        Pause
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePortal;
