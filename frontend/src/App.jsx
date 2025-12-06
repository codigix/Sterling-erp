import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminLayout from "./components/layout/AdminLayout";
import DepartmentLayout from "./components/layout/DepartmentLayout";

// Admin Components
import AdminDashboard from "./pages/admin/AdminDashboard";
import OverviewPage from "./pages/admin/OverviewPage";
import ProjectsPage from "./pages/admin/ProjectsPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import VendorsPage from "./pages/admin/VendorsPage";
import MaterialsPage from "./pages/admin/MaterialsPage";
import ProductionPage from "./pages/admin/ProductionPage";
import EmployeesPage from "./pages/admin/EmployeesPage";
import ResourcesPage from "./pages/admin/ResourcesPage";
import SalesOrdersPage from "./pages/admin/SalesOrdersPage";
import UserManagement from "./pages/admin/UserManagement";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import AuditLogs from "./pages/admin/AuditLogs";
import SystemSettings from "./pages/admin/SystemSettings";
import RoleManagement from "./pages/admin/RoleManagement";
import EmployeeManagement from "./pages/admin/EmployeeManagement";

// Sales Pages
import SalesDashboard from "./pages/sales/SalesDashboard";

// Engineering Pages
import EngineeringTasksPage from "./pages/engineering/EngineeringTasksPage";

// Procurement Pages
import ProcurementTasksPage from "./pages/procurement/ProcurementTasksPage";

// QC Pages
import QCTasksPage from "./pages/qc/QCTasksPage";

// Inventory Pages
import InventoryTasksPage from "./pages/inventory/InventoryTasksPage";

// Production Pages
import ProductionTasksPage from "./pages/production/ProductionTasksPage";

// Employee Portal
import EmployeePortalPage from "./pages/employee/EmployeePortalPage";
import EmployeeDashboardLayout from "./components/layout/EmployeeDashboardLayout";
import EmployeeDashboardHome from "./pages/employee/EmployeeDashboardHome";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import EmployeeAttendance from "./pages/employee/EmployeeAttendance";
import EmployeeTasks from "./pages/employee/EmployeeTasks";
import EmployeeProjects from "./pages/employee/EmployeeProjects";
import EmployeeAlerts from "./pages/employee/EmployeeAlerts";
import EmployeeUpdates from "./pages/employee/EmployeeUpdates";
import EmployeeSettings from "./pages/employee/EmployeeSettings";

// Reports/Tracking Pages
import ProjectTrackingDashboard from "./pages/reports/ProjectTrackingDashboard";
import EmployeeTrackingDashboard from "./pages/reports/EmployeeTrackingDashboard";

// Notifications
import NotificationsPage from "./pages/notifications/NotificationsPage";

import "./App.css";

const SessionWatcher = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      navigate("/login", { replace: true });
    };

    window.addEventListener("app:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("app:session-expired", handleSessionExpired);
  }, [logout, navigate]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <SessionWatcher />
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="sales-orders" element={<SalesOrdersPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="materials" element={<MaterialsPage />} />
              <Route path="production" element={<ProductionPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="roles" element={<RoleManagement />} />
              <Route path="employee-management" element={<EmployeeManagement />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            {/* Department Routes - Task-Oriented Pages */}
            <Route path="/department" element={<DepartmentLayout />}>
              <Route path="sales" element={<SalesDashboard />} />
              <Route path="engineering" element={<EngineeringTasksPage />} />
              <Route path="procurement" element={<ProcurementTasksPage />} />
              <Route path="qc" element={<QCTasksPage />} />
              <Route path="inventory" element={<InventoryTasksPage />} />
              <Route path="production" element={<ProductionTasksPage />} />
            </Route>

            {/* Employee Routes */}
            <Route path="/employee" element={<EmployeeDashboardLayout />}>
              <Route path="dashboard" element={<EmployeeDashboardHome />} />
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="tasks" element={<EmployeeTasks />} />
              <Route path="projects" element={<EmployeeProjects />} />
              <Route path="alerts" element={<EmployeeAlerts />} />
              <Route path="updates" element={<EmployeeUpdates />} />
              <Route path="settings" element={<EmployeeSettings />} />
            </Route>

            {/* Legacy Employee Portal */}
            <Route path="/employee-portal" element={<DepartmentLayout />}>
              <Route path="portal" element={<EmployeePortalPage />} />
            </Route>

            {/* Reports Routes */}
            <Route path="/reports" element={<DepartmentLayout />}>
              <Route
                path="project-tracking"
                element={<ProjectTrackingDashboard />}
              />
              <Route
                path="employee-tracking"
                element={<EmployeeTrackingDashboard />}
              />
            </Route>

            {/* Shared Pages */}
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
