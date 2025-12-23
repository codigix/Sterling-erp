import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Settings,
  Home,
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Calendar,
  CheckSquare,
  AlertCircle,
  Briefcase,
  TrendingUp,
  X,
} from "lucide-react";

const EmployeeDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/employee/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Profile",
      path: "/employee/profile",
      icon: User,
    },
    {
      title: "Attendance",
      path: "/employee/attendance",
      icon: Calendar,
    },
    {
      title: "Tasks",
      path: "/employee/tasks",
      icon: CheckSquare,
    },
    {
      title: "Projects",
      path: "/employee/projects",
      icon: Briefcase,
    },
    {
      title: "Alerts",
      path: "/employee/alerts",
      icon: AlertCircle,
    },
    {
      title: "Updates",
      path: "/employee/updates",
      icon: TrendingUp,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40">
        <div className="flex items-center text-xs justify-between h-full px-6">
          {/* Left side */}
          <div className="flex items-center text-xs">
            <button
              className="md:hidden mr-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <Link to="/employee/dashboard" className="flex items-center text-xs">
              <div className="font-bold text-xl text-primary-600 dark:text-primary-400">
                Employee Portal
              </div>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center text-xs space-x-4">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Bell size={20} className="text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-xs space-x-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center text-xs justify-center text-white font-bold">
                  {user?.name?.charAt(0) || "E"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium  dark:">
                    {user?.name || "Employee"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.role || "Employee"}
                  </p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <Link
                    to="/employee/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center text-xs space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/employee/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center text-xs space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                  <hr className="my-2 border-slate-200 dark:border-slate-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center text-xs space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center text-xs space-x-3 p-2 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border-l-4 border-primary-600"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              © 2025 Sterling ERP<br />
              Employee Portal
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="fixed top-16 left-0 right-0 bottom-0 md:left-64 overflow-auto bg-slate-50 dark:">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboardLayout;
