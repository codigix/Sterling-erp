import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const EmployeeTrackingDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTracking, setEmployeeTracking] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeDetails();
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      const employees = response.data.filter(u => u.role !== 'admin');
      setEmployees(employees);
      setError('');
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const trackingRes = await axios.get(`/api/tracking/employee/${selectedEmployee.id}`);
      setEmployeeTracking(trackingRes.data);

      const performanceRes = await axios.get(`/api/tracking/employee/${selectedEmployee.id}/performance`);
      setPerformance(performanceRes.data);
    } catch (err) {
      console.error('Failed to fetch employee details:', err);
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 80) return 'success';
    if (efficiency >= 60) return 'info';
    if (efficiency >= 40) return 'warning';
    return 'danger';
  };

  const getCompletionRate = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Employee Tracking Dashboard</h1>
        <p>Monitor employee performance and task completion</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tracking-layout">
        <div className="employees-sidebar">
          <Card title="Employees">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="employees-list">
                {employees.map(employee => (
                  <div
                    key={employee.id}
                    className={`employee-item ${selectedEmployee?.id === employee.id ? 'active' : ''}`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <h4>{employee.username}</h4>
                    <small>{employee.email}</small>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="tracking-content">
          {selectedEmployee ? (
            <>
              <Card className="content-card" title="Employee Details">
                <div className="employee-overview">
                  <div className="overview-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedEmployee.username}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedEmployee.email}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Role:</span>
                    <Badge type="info" text={selectedEmployee.role} />
                  </div>
                </div>
              </Card>

              {performance && (
                <Card className="content-card" title="Performance Metrics">
                  <div className="performance-grid">
                    <div className="metric-card">
                      <h4>Total Tasks Assigned</h4>
                      <div className="metric-value">{performance.total_tasks_assigned || 0}</div>
                    </div>
                    <div className="metric-card">
                      <h4>Tasks Completed</h4>
                      <div className="metric-value">{performance.total_tasks_completed || 0}</div>
                    </div>
                    <div className="metric-card">
                      <h4>In Progress</h4>
                      <div className="metric-value">{performance.total_tasks_in_progress || 0}</div>
                    </div>
                    <div className="metric-card">
                      <h4>Completion Rate</h4>
                      <div className="metric-value">
                        {getCompletionRate(performance.total_tasks_completed, performance.total_tasks_assigned)}%
                      </div>
                    </div>
                    <div className="metric-card">
                      <h4>Tasks Paused</h4>
                      <div className="metric-value">{performance.total_tasks_paused || 0}</div>
                    </div>
                    <div className="metric-card">
                      <h4>Tasks Cancelled</h4>
                      <div className="metric-value">{performance.total_tasks_cancelled || 0}</div>
                    </div>
                    <div className="metric-card">
                      <h4>Average Efficiency</h4>
                      <div className="metric-value">
                        <Badge
                          type={getEfficiencyColor(performance.average_efficiency)}
                          text={`${performance.average_efficiency || 0}%`}
                        />
                      </div>
                    </div>
                    <div className="metric-card">
                      <h4>Total Hours Worked</h4>
                      <div className="metric-value">{(performance.total_hours_worked || 0).toFixed(1)}h</div>
                    </div>
                  </div>
                </Card>
              )}

              {employeeTracking && employeeTracking.length > 0 && (
                <Card className="content-card" title="Project Assignments">
                  <div className="project-assignments">
                    {employeeTracking.map(tracking => (
                      <div key={tracking.id} className="assignment-card">
                        <div className="assignment-header">
                          <h4>{tracking.project_name}</h4>
                          {tracking.production_stage_id && (
                            <Badge type="info" text={tracking.stage_name} />
                          )}
                        </div>
                        <div className="assignment-stats">
                          <div className="stat-row">
                            <span className="stat-label">Tasks Assigned:</span>
                            <span className="stat-value">{tracking.tasks_assigned}</span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Completed:</span>
                            <span className="stat-value">{tracking.tasks_completed}</span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">In Progress:</span>
                            <span className="stat-value">{tracking.tasks_in_progress}</span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Efficiency:</span>
                            <Badge
                              type={getEfficiencyColor(tracking.efficiency_percentage)}
                              text={`${tracking.efficiency_percentage}%`}
                            />
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Hours Worked:</span>
                            <span className="stat-value">{tracking.total_hours_worked.toFixed(1)}h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="content-card">
              <div className="empty-state">
                <p>Select an employee to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeTrackingDashboard;
