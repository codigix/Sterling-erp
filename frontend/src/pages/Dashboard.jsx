import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sterling ERP Dashboard</h1>
        <div className="header-actions">
          {user?.role === 'Admin' && (
            <Link to="/admin/dashboard" className="admin-btn">
              Admin Panel
            </Link>
          )}
          <div className="user-info">
            <span>Welcome, {user?.username} ({user?.role})</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Projects</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Active Production</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Pending QC</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Inventory Items</h3>
            <p className="stat-number">0</p>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <p>No recent activity</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;