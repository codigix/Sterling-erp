import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../common/NotificationBell";
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Settings,
  Home,
  Menu,
  User,
  LogOut,
  Calendar,
  CheckSquare,
  AlertCircle,
  Briefcase,
  TrendingUp,
  X,
  ChevronDown,
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
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center">
            <button
              className="lg:hidden mr-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <Link to="/employee/dashboard" className="flex items-center">
              <img src="/logo.png" alt="Sterling ERP" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex-1"></div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                    {user?.username?.charAt(0).toUpperCase() || "E"}
                  </span>
                </div>
                <span className="hidden md:block text-slate-700 dark:text-slate-300 text-sm">
                  {user?.username || "Employee"}
                </span>
                <ChevronDown size={16} className="hidden md:block text-slate-600 dark:text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-900 dark:text-white">
                      {user?.name || "Employee"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.role || "Employee"}
                    </p>
                  </div>
                  <Link
                    to="/employee/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/employee/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-2 border-primary-200 dark:border-primary-900/50 shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-sm">{item.title}</span>
                </Link>
              );
            })}
          </nav>

       
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
      <main className="fixed top-16 left-0 right-0 bottom-0 md:left-64 overflow-auto bg-white dark:bg-slate-900">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboardLayout;
