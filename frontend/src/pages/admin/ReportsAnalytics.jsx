import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  Download,
  LayoutDashboard,
  Briefcase,
  Building2,
  Truck,
  Package,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
} from 'lucide-react';

const ReportsAnalytics = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const reportData = {
    overview: {
      completedProjects: 24,
      onTimeDelivery: 94,
      totalRevenue: 2850000,
      activeAlerts: 5
    },
    projects: [
      { id: 1, name: 'ERP System Upgrade', status: 'Active', progress: 65, startDate: '2025-01-15', expectedCompletion: '2025-04-30', onTime: true },
      { id: 2, name: 'Database Migration', status: 'Completed', progress: 100, startDate: '2024-11-01', expectedCompletion: '2024-12-15', onTime: true },
      { id: 3, name: 'API Development', status: 'Active', progress: 45, startDate: '2025-02-01', expectedCompletion: '2025-05-15', onTime: true },
      { id: 4, name: 'UI Redesign', status: 'Planning', progress: 15, startDate: '2025-03-01', expectedCompletion: '2025-06-30', onTime: false },
      { id: 5, name: 'Mobile App Development', status: 'Active', progress: 35, startDate: '2025-01-20', expectedCompletion: '2025-07-15', onTime: true },
    ],
    departments: [
      { name: 'Engineering', totalUsers: 15, completedTasks: 342, avgEfficiency: 92 },
      { name: 'Production', totalUsers: 28, completedTasks: 521, avgEfficiency: 88 },
      { name: 'Quality Control', totalUsers: 12, completedTasks: 287, avgEfficiency: 97 },
      { name: 'Procurement', totalUsers: 8, completedTasks: 156, avgEfficiency: 85 },
    ],
    vendors: [
      { name: 'ABC Supplies', totalOrders: 45, onTimeDelivery: 96, qualityRating: 4.8, totalValue: 850000, status: 'Excellent' },
      { name: 'XYZ Industries', totalOrders: 32, onTimeDelivery: 89, qualityRating: 4.2, totalValue: 620000, status: 'Good' },
      { name: 'Global Trade Ltd', totalOrders: 28, onTimeDelivery: 92, qualityRating: 4.6, totalValue: 750000, status: 'Excellent' },
      { name: 'Regional Suppliers', totalOrders: 18, onTimeDelivery: 78, qualityRating: 3.9, totalValue: 380000, status: 'Good' },
      { name: 'Tech Components Co', totalOrders: 52, onTimeDelivery: 94, qualityRating: 4.7, totalValue: 1200000, status: 'Excellent' },
    ],
    inventory: {
      totalItems: 1250,
      itemsReceived: 320,
      itemsIssued: 285,
      lowStockItems: 18,
      items: [
        { code: 'MAT-001', description: 'Steel Sheets (20mm)', currentStock: 450, minStock: 200, lastMovement: '2025-12-10', status: 'In Stock' },
        { code: 'MAT-002', description: 'Aluminum Bars', currentStock: 85, minStock: 150, lastMovement: '2025-12-08', status: 'Low Stock' },
        { code: 'MAT-003', description: 'Copper Wire', currentStock: 320, minStock: 100, lastMovement: '2025-12-12', status: 'In Stock' },
        { code: 'MAT-004', description: 'Plastic Components', currentStock: 1200, minStock: 500, lastMovement: '2025-12-11', status: 'In Stock' },
        { code: 'MAT-005', description: 'Fasteners (Bolts)', currentStock: 2500, minStock: 1000, lastMovement: '2025-12-09', status: 'In Stock' },
        { code: 'MAT-006', description: 'Rubber Seals', currentStock: 140, minStock: 300, lastMovement: '2025-12-07', status: 'Low Stock' },
      ]
    },
    employees: [
      { id: 'EMP-001', name: 'Rajesh Kumar', department: 'Engineering', tasksCompleted: 45, efficiency: 94, qualityScore: 4.8, attendance: 98, rating: 4.8 },
      { id: 'EMP-002', name: 'Priya Singh', department: 'Production', tasksCompleted: 52, efficiency: 91, qualityScore: 4.6, attendance: 96, rating: 4.7 },
      { id: 'EMP-003', name: 'Amit Patel', department: 'Quality Control', tasksCompleted: 38, efficiency: 97, qualityScore: 4.9, attendance: 99, rating: 4.9 },
      { id: 'EMP-004', name: 'Neha Sharma', department: 'Procurement', tasksCompleted: 35, efficiency: 88, qualityScore: 4.4, attendance: 94, rating: 4.5 },
      { id: 'EMP-005', name: 'Vikram Desai', department: 'Engineering', tasksCompleted: 42, efficiency: 89, qualityScore: 4.3, attendance: 92, rating: 4.4 },
    ]
  };

  const exportReport = (format) => {
    const data = JSON.stringify(reportData[selectedReport], null, 2);
    const element = document.createElement('a');
    const file = new Blob([data], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedReport}_report.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setExportDropdownOpen(false);
  };

  const reportTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'vendors', label: 'Vendors', icon: Truck },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'employees', label: 'Employees', icon: Users },
  ];

  return (
    <div className="w-full min-h-screen bg-white space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold ">Reports & Analytics</h1>
          <p className="text-sm text-slate-600 mt-1 text-left">
            Comprehensive insights into Sterling ERP operations
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-slate-400 px-2 py-2">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-xs gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                <button onClick={() => exportReport('pdf')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm">Export as PDF</button>
                <button onClick={() => exportReport('excel')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm border-t border-slate-200">Export as Excel</button>
                <button onClick={() => exportReport('csv')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm border-t border-slate-200">Export as CSV</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-8 overflow-x-auto">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`pb-4 px-1 font-medium text-sm flex items-center text-xs gap-2 transition-all border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div>
            <h2 className="text-md font-semibold  mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Projects Completed', value: reportData?.overview?.completedProjects || 0, icon: CheckCircle2, color: 'blue', change: '+15% vs last month' },
                { label: 'On-Time Delivery', value: `${reportData?.overview?.onTimeDelivery || 0}%`, icon: Clock, color: 'emerald', change: 'Target: 95%' },
                { label: 'Revenue Generated', value: `₹${(reportData?.overview?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'cyan', change: 'This period' },
                { label: 'Active Alerts', value: reportData?.overview?.activeAlerts || 0, icon: AlertTriangle, color: 'amber', change: 'Requires attention' },
              ].map((metric, idx) => {
                const Icon = metric.icon;
                const colorBg = { blue: 'bg-blue-50', emerald: 'bg-emerald-50', cyan: 'bg-cyan-50', amber: 'bg-amber-50' }[metric.color];
                const colorIcon = { blue: 'text-blue-600', emerald: 'text-emerald-600', cyan: 'text-cyan-600', amber: 'text-amber-600' }[metric.color];
                const colorText = { blue: 'text-blue-600', emerald: 'text-emerald-600', cyan: 'text-cyan-600', amber: 'text-amber-600' }[metric.color];
                return (
                  <Card key={idx} className="hover:shadow-lg transition-shadow border border-slate-100">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{metric.label}</p>
                          <p className="text-2xl font-bold ">{metric.value}</p>
                          <p className={`text-xs ${colorText} mt-2 font-medium`}>{metric.change}</p>
                        </div>
                        <div className={`${colorBg} p-3 rounded-lg flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${colorIcon}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 hover:shadow-lg transition-shadow border border-slate-100">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-xs gap-2 text-lg">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Project Status Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="w-12 h-12 text-slate-300 mb-3" />
                  <h6 className="text-slate-600 font-medium mb-1">Chart Visualization</h6>
                  <p className="text-slate-500 text-sm">Interactive charts will be displayed here showing project trends over time</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-slate-100">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-xs gap-2 text-lg">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span>Department Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  { name: 'Engineering', value: 95, color: 'bg-blue-500' },
                  { name: 'Production', value: 88, color: 'bg-emerald-500' },
                  { name: 'Quality Control', value: 97, color: 'bg-cyan-500' },
                  { name: 'Procurement', value: 92, color: 'bg-amber-500' },
                ].map((dept, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                      <span className="text-sm font-bold ">{dept.value}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className={`${dept.color} h-2 rounded-full`} style={{width: `${dept.value}%`}}></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedReport === 'projects' && (
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center text-xs gap-2 text-lg">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <span>Project Performance Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-left font-semibold text-slate-700">Project ID</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Project Name</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Status</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Progress</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Start Date</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Expected Completion</th>
                    <th className="p-2 text-left font-semibold text-slate-700">On-Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.projects || []).map((project, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-2 font-semibold ">PRJ-{project.id}</td>
                      <td className="p-2 text-slate-700">{project.name}</td>
                      <td className="p-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          project.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center text-xs gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${project.progress}%`}}></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 w-8">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="p-2 text-slate-700">{new Date(project.startDate).toLocaleDateString()}</td>
                      <td className="p-2 text-slate-700">{new Date(project.expectedCompletion).toLocaleDateString()}</td>
                      <td className="p-2">
                        {project.onTime ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === 'departments' && (
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center text-xs gap-2 text-lg">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <span>Department Productivity Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(reportData?.departments || []).map((dept, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <h4 className="font-semibold  mb-6">{dept.name}</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center text-xs justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold ">{dept.totalUsers}</p>
                      <p className="text-xs text-slate-600 mt-1">Users</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center text-xs justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="text-2xl font-bold ">{dept.completedTasks}</p>
                      <p className="text-xs text-slate-600 mt-1">Tasks Done</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center text-xs justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6 text-cyan-600" />
                      </div>
                      <p className="text-2xl font-bold ">{dept.avgEfficiency}%</p>
                      <p className="text-xs text-slate-600 mt-1">Efficiency</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === 'vendors' && (
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center text-xs gap-2 text-lg">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <span>Vendor Performance Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-left font-semibold text-slate-700">Vendor Name</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Total Orders</th>
                    <th className="p-2 text-left font-semibold text-slate-700">On-Time Delivery</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Quality Rating</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Total Value</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.vendors || []).map((vendor, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-2">
                        <div className="flex items-center text-xs gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center text-xs justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600">{vendor.name.charAt(0)}</span>
                          </div>
                          <span className="font-medium ">{vendor.name}</span>
                        </div>
                      </td>
                      <td className="p-2 text-slate-700">{vendor.totalOrders}</td>
                      <td className="p-2 text-slate-700">{vendor.onTimeDelivery}%</td>
                      <td className="p-2">
                        <div className="flex items-center text-xs gap-1">
                          <span className="text-sm font-medium text-slate-700 mr-1">{vendor.qualityRating}/5</span>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < vendor.qualityRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-2 font-semibold ">₹{vendor.totalValue.toLocaleString()}</td>
                      <td className="p-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          vendor.status === 'Excellent' ? 'bg-emerald-100 text-emerald-700' :
                          vendor.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {vendor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === 'inventory' && (
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center text-xs gap-2 text-lg">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <span>Inventory Movement Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Items', value: reportData?.inventory?.totalItems || 0, color: 'bg-blue-500', icon: Package },
                { label: 'Items Received', value: reportData?.inventory?.itemsReceived || 0, color: 'bg-emerald-500', icon: TrendingUp },
                { label: 'Items Issued', value: reportData?.inventory?.itemsIssued || 0, color: 'bg-amber-500', icon: TrendingUp },
                { label: 'Low Stock Alerts', value: reportData?.inventory?.lowStockItems || 0, color: 'bg-red-500', icon: AlertTriangle },
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <div key={idx} className={`${metric.color} text-white rounded-xl p-6 text-center`}>
                    <Icon className="w-6 h-6 mx-auto mb-3 opacity-80" />
                    <p className="text-3xl font-bold mb-1">{metric.value}</p>
                    <p className="text-sm opacity-90">{metric.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-left font-semibold text-slate-700">Item Code</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Description</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Current Stock</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Min. Stock</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Last Movement</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.inventory?.items || []).map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-2 font-semibold ">{item.code}</td>
                      <td className="p-2 text-slate-700">{item.description}</td>
                      <td className="p-2 text-slate-700">{item.currentStock}</td>
                      <td className="p-2 text-slate-700">{item.minStock}</td>
                      <td className="p-2 text-slate-700">{new Date(item.lastMovement).toLocaleDateString()}</td>
                      <td className="p-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.currentStock < item.minStock
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.currentStock < item.minStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === 'employees' && (
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center text-xs gap-2 text-lg">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span>Employee Performance Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-left font-semibold text-slate-700">Employee</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Department</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Tasks Completed</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Efficiency</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Quality Score</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Attendance</th>
                    <th className="p-2 text-left font-semibold text-slate-700">Performance Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData?.employees || []).map((employee, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-2">
                        <div className="flex items-center text-xs gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center text-xs justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600">{employee.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium ">{employee.name}</p>
                            <p className="text-xs text-slate-500">ID: {employee.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-slate-700">{employee.department}</td>
                      <td className="p-2 text-slate-700">{employee.tasksCompleted}</td>
                      <td className="p-2 text-slate-700">{employee.efficiency}%</td>
                      <td className="p-2">
                        <div className="flex items-center text-xs gap-1">
                          <span className="text-sm font-medium text-slate-700 mr-1">{employee.qualityScore}/5</span>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < employee.qualityScore
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-2 text-slate-700">{employee.attendance}%</td>
                      <td className="p-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          employee.rating >= 4.5 ? 'bg-emerald-100 text-emerald-700' :
                          employee.rating >= 4 ? 'bg-blue-100 text-blue-700' :
                          employee.rating >= 3 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {employee.rating}/5
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsAnalytics;
