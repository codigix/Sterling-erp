import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../common/NotificationBell";
import {
  Menu,
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
  Zap,
  Users,
  Calendar,
  Activity,
  BarChart3,
  Layers,
  Truck,
  ClipboardList,
  FileText,
  Monitor,
} from "lucide-react";

const DepartmentLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const departmentModules = {
    sales: {
      title: "Root Cards",
      icon: Layers,
      path: "/department/root-cards",
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
    const rawRole = user?.role?.toLowerCase() || "sales";
    
    // Handle role variations
    if (rawRole.includes("production")) return departmentModules.production;
    if (rawRole.includes("inventory")) return departmentModules.inventory;
    if (rawRole.includes("procurement")) return departmentModules.procurement;
    if (rawRole.includes("qc") || rawRole.includes("quality")) return departmentModules.qc;
    if (rawRole.includes("engineering") || rawRole.includes("design")) return departmentModules.engineering;
    if (rawRole.includes("sales")) return departmentModules.sales;
    
    // Check for "management" or "admin" roles
    if (rawRole.includes("admin") || rawRole.includes("management")) {
      // Admins see Sales/Root Cards by default in DepartmentLayout
      return departmentModules.sales;
    }
    
    return departmentModules[rawRole] || departmentModules.sales;
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getCurrentPageTitle = () => {
    const dept = getDepartmentRole();
    return dept.title;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40">
        <div className="flex items-center text-xs justify-between h-full px-6">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center text-xs">
            <button
              className="lg:hidden mr-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu size={20} />
            </button>
            <Link
              to={getDepartmentRole().path}
              className="flex items-center text-xs"
            >
              <img src="/logo.png" alt="Sterling ERP" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex-1"></div>

          {/* Right side */}
          <div className="flex items-center text-xs space-x-4">
            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center text-xs space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center text-xs justify-center">
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
                    <p className="text-sm font-medium  dark:">
                      {user?.username}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {getCurrentPageTitle()}
                    </p>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-xs w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
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
              className="hidden lg:flex items-center text-xs justify-center w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Your Department */}
            {getDepartmentRole().title !== "Production" && (
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
                          className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
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
            )}

            {/* Production Flow Menu - Only show for Production department */}
            {getDepartmentRole().title === "Production" && (
              <div>
                <h6
                  className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ${
                    sidebarCollapsed ? "text-center" : ""
                  }`}
                >
                  {!sidebarCollapsed && "Production Flow"}
                </h6>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/department/production"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Home size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/root-cards"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/root-cards")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Zap size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Root Cards</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/plans"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/plans")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <ClipboardList size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Production Plans</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/work-orders"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/work-orders")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <FileText size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Work Orders</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/job-cards"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/job-cards")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <ClipboardList size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Job Cards</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/workstations"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/workstations")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Monitor size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Workstations</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/scheduling"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/scheduling")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Calendar size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Scheduling</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/resources"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/resources")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Users size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Resource Allocation</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/assign-tasks"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/assign-tasks")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <CheckSquare size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Assign Tasks</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/workflow-tasks"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/workflow-tasks")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Zap size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Workflow Tasks</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/department-tasks"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/department-tasks")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <ClipboardList size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Department Tasks</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/outsource-tasks"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/outsource-tasks")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Package size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Outsource Tasks</span>}
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* Production Execution Menu - Only show for Production department */}
            {getDepartmentRole().title === "Production" && (
              <div>
                <h6
                  className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ${
                    sidebarCollapsed ? "text-center" : ""
                  }`}
                >
                  {!sidebarCollapsed && "Execution & Tracking"}
                </h6>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/department/production/active-stages"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/active-stages")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Layers size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Active Stages</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/mes-tasks"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/mes-tasks")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Activity size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">MES Tasks</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/stage-progress"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/stage-progress")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <BarChart3 size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Stage Progress</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/task-tracking"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/task-tracking")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Activity size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Task Tracking</span>}
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* Production Completion Menu - Only show for Production department */}
            {getDepartmentRole().title === "Production" && (
              <div>
                <h6
                  className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ${
                    sidebarCollapsed ? "text-center" : ""
                  }`}
                >
                  {!sidebarCollapsed && "Completion & Delivery"}
                </h6>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/department/production/stage-details"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/stage-details")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <ClipboardList size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Stage Details</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/specifications"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/specifications")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Layers size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Specifications</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/challans"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/challans")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Truck size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Challans</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/department/production/performance"
                      className={`flex items-center text-xs px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive("/department/production/performance")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <BarChart3 size={18} className="flex-shrink-0" />
                      {!sidebarCollapsed && <span className="ml-3">Performance</span>}
                    </Link>
                  </li>
                </ul>
              </div>
            )}

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
                    className="flex items-center text-xs px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                      className="flex items-center text-xs px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
        style={{
          marginLeft: isDesktop ? (sidebarCollapsed ? '4rem' : '16rem') : '0',
          transition: 'margin-left 300ms ease-in-out'
        }}
        className="pt-16 min-h-[calc(100vh-4rem)]"
      >
        {/* Page Content */}
        <Outlet />
      </main>
    </div>
  );
};

export default DepartmentLayout;
