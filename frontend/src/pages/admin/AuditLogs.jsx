import React, { useState } from 'react';
import {
  Search,
  Bell,
  Grid3X3,
  User,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  LayoutDashboard,
  FolderOpen,
  Users,
  MessageSquare,
  Calendar,
  Handshake,
  Target,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SkeletonLoader = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const KPICard = ({ title, value, change, changeType }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {change && (
          <p className={`text-sm font-semibold flex items-center ${
            changeType === 'positive' ? 'text-emerald-600' :
            changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              changeType === 'positive' ? 'bg-emerald-500' :
              changeType === 'negative' ? 'bg-red-500' : 'bg-gray-500'
            }`}></span>
            {change}
          </p>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
        changeType === 'positive' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-emerald-100 shadow-lg' :
        changeType === 'negative' ? 'bg-gradient-to-br from-red-100 to-red-200 shadow-red-100 shadow-lg' :
        'bg-gradient-to-br from-blue-100 to-blue-200 shadow-blue-100 shadow-lg'
      }`}>
        <div className={`w-7 h-1.5 rounded-full transition-all duration-300 ${
          changeType === 'positive' ? 'bg-emerald-600' :
          changeType === 'negative' ? 'bg-red-600' : 'bg-blue-600'
        }`}></div>
      </div>
    </div>
  </div>
);

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  return (
    <div className={`${
      sidebarOpen ? 'w-64' : 'w-16'
    } bg-slate-900 text-white transition-all duration-300 fixed left-0 top-0 h-full z-40 lg:relative lg:z-auto ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      <div className="p-4 border-b border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">UB</span>
          </div>
          {sidebarOpen && <span className="font-semibold">UBold</span>}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-white"
        >
          <Grid3X3 size={20} />
        </button>
      </div>
    </div>

    <nav className="p-4">
      <div className="mb-6">
        <h3 className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!sidebarOpen && 'hidden'}`}>
          Navigation
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-800 text-white w-full text-left hover:bg-slate-700"
            >
              <LayoutDashboard size={20} />
              {sidebarOpen && <span>Dashboard</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left"
            >
              <FolderOpen size={20} />
              {sidebarOpen && <span>Users</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/admin/roles')}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left"
            >
              <Users size={20} />
              {sidebarOpen && <span>Roles</span>}
            </button>
          </li>
        </ul>
      </div>

      <div className="mb-6">
        <h3 className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!sidebarOpen && 'hidden'}`}>
          Apps
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate('/admin/reports')}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left"
            >
              <MessageSquare size={20} />
              {sidebarOpen && <span>Reports</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/admin/settings')}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left"
            >
              <Calendar size={20} />
              {sidebarOpen && <span>Settings</span>}
            </button>
          </li>
        </ul>
      </div>

      <div>
        <h3 className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!sidebarOpen && 'hidden'}`}>
          CRM
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-600 text-white w-full text-left hover:bg-blue-700"
            >
              <Handshake size={20} />
              {sidebarOpen && <span>Deals</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left"
            >
              <Target size={20} />
              {sidebarOpen && <span>Opportunities</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/admin/roles')}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left"
            >
              <Phone size={20} />
              {sidebarOpen && <span>Leads</span>}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </div>
);
}

const TopBar = () => (
  <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
    <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 flex-1">
      <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">Deals</h1>
      <nav className="hidden sm:block text-sm text-gray-500">
        <span>UBold</span>
        <span className="mx-2">/</span>
        <span>CRM</span>
        <span className="mx-2">/</span>
        <span>Deals</span>
      </nav>
    </div>

    <div className="flex items-center space-x-2 lg:space-x-4">
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64"
        />
      </div>

      <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
        <Bell size={20} />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
      </button>

      <div className="flex items-center space-x-2">
        <img src="https://via.placeholder.com/32x32" alt="User" className="w-8 h-8 rounded-full" />
        <span className="hidden sm:block text-sm font-medium">Geneva K.</span>
        <ChevronDown size={16} className="text-gray-500" />
      </div>
    </div>
  </div>
);

const DealsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Mock data for deals
  const dealsData = [
    {
      id: 1,
      name: 'Enterprise Software',
      company: 'Google Inc',
      companyLogo: 'https://via.placeholder.com/32x32/4285f4/ffffff?text=G',
      amount: 102000,
      stage: 'Proposal Sent',
      probability: 65,
      closingDate: '2025-08-15'
    },
    {
      id: 2,
      name: 'Marketing Automation',
      company: 'Airbnb',
      companyLogo: 'https://via.placeholder.com/32x32/ff5a5f/ffffff?text=A',
      amount: 85000,
      stage: 'Qualified',
      probability: 55,
      closingDate: '2025-08-10'
    },
    {
      id: 3,
      name: 'Cloud Storage Deal',
      company: 'Dropbox',
      companyLogo: 'https://via.placeholder.com/32x32/0061ff/ffffff?text=D',
      amount: 47000,
      stage: 'Negotiation',
      probability: 80,
      closingDate: '2025-08-18'
    },
    {
      id: 4,
      name: 'AI Chatbot Integration',
      company: 'OpenAI',
      companyLogo: 'https://via.placeholder.com/32x32/412991/ffffff?text=O',
      amount: 59500,
      stage: 'Proposal Sent',
      probability: 65,
      closingDate: '2025-08-22'
    },
    {
      id: 5,
      name: 'eCommerce Platform',
      company: 'Apple',
      companyLogo: 'https://via.placeholder.com/32x32/000000/ffffff?text=A',
      amount: 71200,
      stage: 'Qualification',
      probability: 45,
      closingDate: '2025-08-25'
    }
  ];

  const kpiData = [
    { title: 'Total deals created', value: '1,230', change: '9.85%', changeType: 'positive' },
    { title: 'Deals won', value: '860', change: '5.20%', changeType: 'positive' },
    { title: 'Deals lost', value: '270', change: '2.45%', changeType: 'negative' },
    { title: 'Highest deal closed', value: '$220,000', change: '', changeType: 'neutral' },
    { title: 'Avg. close time', value: '5.2 days', change: '+1.1%', changeType: 'negative' }
  ];

  const getStageColor = (stage) => {
    switch (stage.toLowerCase()) {
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'negotiation': return 'bg-blue-100 text-blue-800';
      case 'proposal sent': return 'bg-purple-100 text-purple-800';
      case 'qualified': return 'bg-yellow-100 text-yellow-800';
      case 'qualification': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 min-h-screen ${
        sidebarOpen ? 'lg:ml-64 ml-0' : 'lg:ml-16 ml-0'
      }`}>
        <TopBar />

        <div className="p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-6">
            {kpiData.map((kpi, index) => (
              <KPICard key={index} {...kpi} />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 lg:px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 text-sm lg:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Plus size={16} />
                <span>Create Deal</span>
              </button>
              <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 lg:px-4 py-2.5 rounded-xl hover:from-gray-700 hover:to-gray-800 text-sm lg:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Delete
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 lg:px-4 py-2.5 rounded-xl hover:from-emerald-700 hover:to-emerald-800 flex items-center space-x-2 text-sm lg:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Grid3X3 size={16} />
                <span>Go to Admin Dashboard</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 backdrop-blur-sm bg-white/80">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 lg:gap-4">
                <select className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-sm bg-gray-50 focus:bg-white text-gray-700">
                  <option>All Stages</option>
                  <option>Qualification</option>
                  <option>Proposal Sent</option>
                  <option>Negotiation</option>
                  <option>Won</option>
                  <option>Lost</option>
                </select>

                <select className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-sm bg-gray-50 focus:bg-white text-gray-700">
                  <option>All Amounts</option>
                  <option>$0 - $50K</option>
                  <option>$50K - $100K</option>
                  <option>$100K+</option>
                </select>

                <select className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-sm bg-gray-50 focus:bg-white text-gray-700">
                  <option>All Categories</option>
                  <option>Enterprise</option>
                  <option>SMB</option>
                  <option>Startup</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm bg-white/90">
            <div className="px-6 lg:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-xl font-bold text-gray-900">Deals Overview</h3>
              <p className="text-sm text-gray-600 mt-1">Manage and track your sales pipeline</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deal Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (USD)
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probability
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Closing Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {dealsData.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 group">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{deal.name}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="w-8 h-8 rounded-full mr-3" src={deal.companyLogo} alt={deal.company} />
                          <div className="text-sm font-medium text-gray-900">{deal.company}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${deal.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{deal.probability}%</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{deal.closingDate}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-110">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-amber-600 hover:text-white hover:bg-amber-600 rounded-lg transition-all duration-200 hover:scale-110">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-110">
                            <Trash2 size={16} />
                          </button>
                        </div>
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
  );
};

export default DealsDashboard;