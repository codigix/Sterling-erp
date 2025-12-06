import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/api';

const ReportsAnalytics = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/reports', {
        params: {
          type: selectedReport,
          startDate: dateRange.start,
          endDate: dateRange.end
        }
      });
      setReportData(response.data);
    } catch (err) {
      setError('Failed to load report data');
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedReport, dateRange]);

  const exportReport = async (format) => {
    try {
      const response = await axios.get('/api/admin/reports/export', {
        params: {
          type: selectedReport,
          format: format,
          startDate: dateRange.start,
          endDate: dateRange.end
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading report data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <i className="mdi mdi-alert-circle text-danger" style={{fontSize: '3rem'}}></i>
        <h5 className="mt-3 text-danger">Error Loading Reports</h5>
        <p className="text-muted mb-3">{error}</p>
        <button onClick={fetchReportData} className="btn btn-primary">
          <i className="mdi mdi-refresh me-1"></i>Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">Reports & Analytics</h4>
              <p className="text-muted mb-0">
                Comprehensive insights into Sterling ERP operations
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="input-group" style={{width: '300px'}}>
                <span className="input-group-text">From</span>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
                <span className="input-group-text">To</span>
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i className="mdi mdi-download me-1"></i>Export
                </button>
                <ul className="dropdown-menu">
                  <li><button className="dropdown-item" onClick={() => exportReport('pdf')}>Export as PDF</button></li>
                  <li><button className="dropdown-item" onClick={() => exportReport('excel')}>Export as Excel</button></li>
                  <li><button className="dropdown-item" onClick={() => exportReport('csv')}>Export as CSV</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <nav className="nav nav-pills nav-justified">
                <a
                  className={`nav-link ${selectedReport === 'overview' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedReport('overview'); }}
                >
                  <i className="mdi mdi-view-dashboard me-1"></i>Overview
                </a>
                <a
                  className={`nav-link ${selectedReport === 'projects' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedReport('projects'); }}
                >
                  <i className="mdi mdi-briefcase me-1"></i>Projects
                </a>
                <a
                  className={`nav-link ${selectedReport === 'departments' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedReport('departments'); }}
                >
                  <i className="mdi mdi-office-building me-1"></i>Departments
                </a>
                <a
                  className={`nav-link ${selectedReport === 'vendors' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedReport('vendors'); }}
                >
                  <i className="mdi mdi-truck me-1"></i>Vendors
                </a>
                <a
                  className={`nav-link ${selectedReport === 'inventory' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedReport('inventory'); }}
                >
                  <i className="mdi mdi-package-variant me-1"></i>Inventory
                </a>
                <a
                  className={`nav-link ${selectedReport === 'employees' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedReport('employees'); }}
                >
                  <i className="mdi mdi-account-group me-1"></i>Employees
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="row">
          {/* Key Metrics */}
          <div className="col-12 mb-4">
            <h5 className="mb-3">Key Performance Indicators</h5>
            <div className="row">
              <div className="col-xl-3 col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm me-3">
                        <div className="avatar-title bg-primary rounded">
                          <i className="mdi mdi-briefcase-check text-white"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="mb-1">{reportData?.overview?.completedProjects || 0}</h4>
                        <p className="text-muted mb-0">Projects Completed</p>
                        <small className="text-success">+15% vs last month</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm me-3">
                        <div className="avatar-title bg-success rounded">
                          <i className="mdi mdi-clock-check text-white"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="mb-1">{reportData?.overview?.onTimeDelivery || 0}%</h4>
                        <p className="text-muted mb-0">On-Time Delivery</p>
                        <small className="text-success">Target: 95%</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm me-3">
                        <div className="avatar-title bg-info rounded">
                          <i className="mdi mdi-currency-inr text-white"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="mb-1">₹{(reportData?.overview?.totalRevenue || 0).toLocaleString()}</h4>
                        <p className="text-muted mb-0">Revenue Generated</p>
                        <small className="text-info">This period</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm me-3">
                        <div className="avatar-title bg-warning rounded">
                          <i className="mdi mdi-alert text-white"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="mb-1">{reportData?.overview?.activeAlerts || 0}</h4>
                        <p className="text-muted mb-0">Active Alerts</p>
                        <small className="text-warning">Requires attention</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="col-lg-8 mb-3">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="card-title mb-0">Project Status Trend</h6>
              </div>
              <div className="card-body">
                <div className="text-center py-5">
                  <i className="mdi mdi-chart-line text-muted" style={{fontSize: '4rem'}}></i>
                  <h6 className="mt-3 text-muted">Chart Visualization</h6>
                  <p className="text-muted">Interactive charts will be displayed here showing project trends over time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 mb-3">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="card-title mb-0">Department Performance</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Engineering</span>
                    <span className="small fw-bold">95%</span>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                    <div className="progress-bar bg-primary" style={{width: '95%'}}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Production</span>
                    <span className="small fw-bold">88%</span>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                    <div className="progress-bar bg-success" style={{width: '88%'}}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Quality Control</span>
                    <span className="small fw-bold">97%</span>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                    <div className="progress-bar bg-info" style={{width: '97%'}}></div>
                  </div>
                </div>
                <div className="mb-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Procurement</span>
                    <span className="small fw-bold">92%</span>
                  </div>
                  <div className="progress" style={{height: '6px'}}>
                    <div className="progress-bar bg-warning" style={{width: '92%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'projects' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Project Performance Report</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Project ID</th>
                        <th>Project Name</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Start Date</th>
                        <th>Expected Completion</th>
                        <th>On-Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.projects || []).map((project, index) => (
                        <tr key={index}>
                          <td>
                            <span className="fw-semibold">PRJ-{project.id}</span>
                          </td>
                          <td>{project.name}</td>
                          <td>
                            <span className={`badge bg-${project.status === 'Completed' ? 'success' : project.status === 'Active' ? 'primary' : 'warning'}`}>
                              {project.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{height: '6px'}}>
                                <div className="progress-bar" style={{width: `${project.progress}%`}}></div>
                              </div>
                              <small>{project.progress}%</small>
                            </div>
                          </td>
                          <td>{new Date(project.startDate).toLocaleDateString()}</td>
                          <td>{new Date(project.expectedCompletion).toLocaleDateString()}</td>
                          <td>
                            <i className={`mdi ${project.onTime ? 'mdi-check-circle text-success' : 'mdi-alert-circle text-danger'}`}></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'departments' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Department Productivity Report</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {(reportData?.departments || []).map((dept, index) => (
                    <div key={index} className="col-lg-6 mb-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">{dept.name}</h6>
                          <div className="row text-center">
                            <div className="col-4">
                              <div className="avatar-md mx-auto mb-2">
                                <div className="avatar-title bg-primary rounded-circle">
                                  <i className="mdi mdi-account-group text-white"></i>
                                </div>
                              </div>
                              <h5 className="mb-1">{dept.totalUsers}</h5>
                              <p className="text-muted mb-0 small">Users</p>
                            </div>
                            <div className="col-4">
                              <div className="avatar-md mx-auto mb-2">
                                <div className="avatar-title bg-success rounded-circle">
                                  <i className="mdi mdi-check-circle text-white"></i>
                                </div>
                              </div>
                              <h5 className="mb-1">{dept.completedTasks}</h5>
                              <p className="text-muted mb-0 small">Tasks Done</p>
                            </div>
                            <div className="col-4">
                              <div className="avatar-md mx-auto mb-2">
                                <div className="avatar-title bg-info rounded-circle">
                                  <i className="mdi mdi-clock text-white"></i>
                                </div>
                              </div>
                              <h5 className="mb-1">{dept.avgEfficiency}%</h5>
                              <p className="text-muted mb-0 small">Efficiency</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'vendors' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Vendor Performance Report</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Vendor Name</th>
                        <th>Total Orders</th>
                        <th>On-Time Delivery</th>
                        <th>Quality Rating</th>
                        <th>Total Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.vendors || []).map((vendor, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-2">
                                <div className="avatar-title bg-primary rounded-circle">
                                  {vendor.name.charAt(0)}
                                </div>
                              </div>
                              <span className="fw-medium">{vendor.name}</span>
                            </div>
                          </td>
                          <td>{vendor.totalOrders}</td>
                          <td>{vendor.onTimeDelivery}%</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-1">{vendor.qualityRating}/5</span>
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`mdi mdi-star ${i < vendor.qualityRating ? 'text-warning' : 'text-muted'}`}></i>
                              ))}
                            </div>
                          </td>
                          <td>₹{vendor.totalValue.toLocaleString()}</td>
                          <td>
                            <span className={`badge bg-${vendor.status === 'Excellent' ? 'success' : vendor.status === 'Good' ? 'primary' : 'warning'}`}>
                              {vendor.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'inventory' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Inventory Movement Report</h6>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-lg-3 col-md-6">
                    <div className="card bg-primary text-white h-100">
                      <div className="card-body text-center">
                        <i className="mdi mdi-package-variant-closed" style={{fontSize: '2rem'}}></i>
                        <h4 className="mt-2 mb-1">{reportData?.inventory?.totalItems || 0}</h4>
                        <p className="mb-0">Total Items</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card bg-success text-white h-100">
                      <div className="card-body text-center">
                        <i className="mdi mdi-plus-circle" style={{fontSize: '2rem'}}></i>
                        <h4 className="mt-2 mb-1">{reportData?.inventory?.itemsReceived || 0}</h4>
                        <p className="mb-0">Items Received</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card bg-warning text-white h-100">
                      <div className="card-body text-center">
                        <i className="mdi mdi-minus-circle" style={{fontSize: '2rem'}}></i>
                        <h4 className="mt-2 mb-1">{reportData?.inventory?.itemsIssued || 0}</h4>
                        <p className="mb-0">Items Issued</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <div className="card bg-danger text-white h-100">
                      <div className="card-body text-center">
                        <i className="mdi mdi-alert-circle" style={{fontSize: '2rem'}}></i>
                        <h4 className="mt-2 mb-1">{reportData?.inventory?.lowStockItems || 0}</h4>
                        <p className="mb-0">Low Stock Alerts</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Item Code</th>
                        <th>Description</th>
                        <th>Current Stock</th>
                        <th>Min. Stock</th>
                        <th>Last Movement</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.inventory?.items || []).map((item, index) => (
                        <tr key={index}>
                          <td>
                            <span className="fw-semibold">{item.code}</span>
                          </td>
                          <td>{item.description}</td>
                          <td>{item.currentStock}</td>
                          <td>{item.minStock}</td>
                          <td>{new Date(item.lastMovement).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge bg-${item.currentStock < item.minStock ? 'danger' : 'success'}`}>
                              {item.currentStock < item.minStock ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'employees' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Employee Performance Report</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Tasks Completed</th>
                        <th>Efficiency</th>
                        <th>Quality Score</th>
                        <th>Attendance</th>
                        <th>Performance Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.employees || []).map((employee, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-2">
                                <div className="avatar-title bg-primary rounded-circle">
                                  {employee.name.charAt(0)}
                                </div>
                              </div>
                              <div>
                                <span className="fw-medium">{employee.name}</span>
                                <br />
                                <small className="text-muted">ID: {employee.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>{employee.department}</td>
                          <td>{employee.tasksCompleted}</td>
                          <td>{employee.efficiency}%</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-1">{employee.qualityScore}/5</span>
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`mdi mdi-star ${i < employee.qualityScore ? 'text-warning' : 'text-muted'}`}></i>
                              ))}
                            </div>
                          </td>
                          <td>{employee.attendance}%</td>
                          <td>
                            <span className={`badge bg-${employee.rating >= 4.5 ? 'success' : employee.rating >= 4 ? 'primary' : employee.rating >= 3 ? 'warning' : 'danger'}`}>
                              {employee.rating}/5
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;