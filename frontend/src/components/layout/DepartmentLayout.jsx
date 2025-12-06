import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Home,
  Package,
  ShoppingCart,
  Wrench,
  CheckSquare,
  Boxes,
  Factory,
  AlertCircle,
} from "lucide-react";
import "./DepartmentLayout.css";

const DepartmentLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const departmentModules = {
    sales: {
      title: "Sales",
      icon: ShoppingCart,
      path: "/department/sales",
    },
    engineering: {
      title: "Engineering",
      icon: Wrench,
      path: "/department/engineering",
    },
    procurement: {
      title: "Procurement",
      icon: Package,
      path: "/department/procurement",
    },
    qc: {
      title: "QC",
      icon: CheckSquare,
      path: "/department/qc",
    },
    inventory: {
      title: "Inventory",
      icon: Boxes,
      path: "/department/inventory",
    },
    production: {
      title: "Production",
      icon: Factory,
      path: "/department/production",
    },
  };

  const getDepartmentRole = () => {
    const userRole = user?.role?.toLowerCase() || "sales";
    return departmentModules[userRole] || departmentModules.sales;
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getCurrentPageTitle = () => {
    const dept = getDepartmentRole();
    return dept.title;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center">
            <button
              className="lg:hidden mr-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu size={20} />
            </button>
            <Link to={getDepartmentRole().path} className="flex items-center">
              <div className="font-bold text-xl text-blue-600 dark:text-blue-400">
                Sterling ERP
              </div>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search tasks..."
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-slate-700 dark:text-slate-300">
                  {user?.username}
                </span>
                <ChevronDown size={16} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {user?.username}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {getCurrentPageTitle()}
                    </p>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-30 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <button
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Your Department */}
            <div>
              <h6
                className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ${
                  sidebarCollapsed ? "text-center" : ""
                }`}
              >
                {!sidebarCollapsed && "My Department"}
              </h6>
              <ul className="space-y-1">
                {(() => {
                  const dept = getDepartmentRole();
                  const IconComponent = dept.icon;
                  return (
                    <li>
                      <Link
                        to={dept.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive(dept.path)
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <IconComponent size={18} className="flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="ml-3">{dept.title} Tasks</span>
                        )}
                      </Link>
                    </li>
                  );
                })()}
              </ul>
            </div>

            {/* Quick Actions */}
            <div>
              <h6
                className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ${
                  sidebarCollapsed ? "text-center" : ""
                }`}
              >
                {!sidebarCollapsed && "Quick Links"}
              </h6>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/notifications"
                    className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <AlertCircle size={18} className="flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="ml-3">Notifications</span>
                    )}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Back to Admin (if admin) */}
            {user?.role?.toLowerCase() === "admin" && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Home size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="ml-3">Admin Panel</span>
                      )}
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "" : ""
        } pt-16`}
      >
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {getCurrentPageTitle()} Tasks
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your department tasks and activities
            </p>
          </div>

          {/* Page Content */}
          <div className="space-y-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DepartmentLayout;
