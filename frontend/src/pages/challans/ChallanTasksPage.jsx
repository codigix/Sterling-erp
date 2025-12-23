import React, { useState } from 'react';
import { Plus, Eye, Edit2, Download, ArrowUp, ArrowDown, Filter, Truck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const ChallanTasksPage = () => {
  const [challans] = useState([
    {
      id: 'CH-OUT-001',
      type: 'outward',
      stage: 'Painting - XYZ Outsourced',
      challanDate: '2025-01-28',
      vendor: 'Quality Paint Services',
      items: 15,
      status: 'issued',
      expectedReturn: '2025-02-05'
    },
    {
      id: 'CH-IN-001',
      type: 'inward',
      stage: 'Painting - XYZ Outsourced',
      challanDate: '2025-01-22',
      vendor: 'Quality Paint Services',
      items: 12,
      status: 'received',
      receivedDate: '2025-01-25'
    },
    {
      id: 'CH-OUT-002',
      type: 'outward',
      stage: 'Plating - ABC Outsourced',
      challanDate: '2025-01-25',
      vendor: 'Chrome Plating Inc',
      items: 8,
      status: 'issued',
      expectedReturn: '2025-02-02'
    },
    {
      id: 'CH-IN-002',
      type: 'inward',
      stage: 'Plating - ABC Outsourced',
      challanDate: '2025-01-18',
      vendor: 'Chrome Plating Inc',
      items: 8,
      status: 'received',
      receivedDate: '2025-01-20'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [showNewChallan, setShowNewChallan] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'in-transit': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    return type === 'outward' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800';
  };

  const filteredChallans = activeTab === 'all'
    ? challans
    : activeTab === 'outward'
      ? challans.filter(c => c.type === 'outward')
      : challans.filter(c => c.type === 'inward');

  const stats = {
    total: challans.length,
    outward: challans.filter(c => c.type === 'outward').length,
    inward: challans.filter(c => c.type === 'inward').length,
    pending: challans.filter(c => c.status === 'issued' || c.status === 'in-transit').length
  };

  return (
    <div className="task-page-container">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Challans</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Outward</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.outward}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Inward</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.inward}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">In Transit</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
        </Card>
      </div>

      {/* Tab and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            All Challans
          </button>
          <button
            onClick={() => setActiveTab('outward')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'outward'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Outward
          </button>
          <button
            onClick={() => setActiveTab('inward')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'inward'
                ? 'bg-green-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Inward
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
            <Filter size={18} />
            Filter
          </button>
          <button
            onClick={() => setShowNewChallan(!showNewChallan)}
            className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            New Challan
          </button>
        </div>
      </div>

      {/* New Challan Form */}
      {showNewChallan && (
        <Card className="mb-6 p-6">
          <h3 className="text-lg font-bold  dark: mb-4">Create New Challan</h3>
          <div className="task-form mb-4">
            <select className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:">
              <option>Select Challan Type...</option>
              <option>Outward (Material sent out)</option>
              <option>Inward (Material received)</option>
            </select>
            <input type="text" placeholder="Stage/Process" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:" />
            <input type="text" placeholder="Vendor Name" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:" />
            <input type="date" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:" />
            <input type="number" placeholder="Number of Items" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:" />
            <textarea placeholder="Items Description" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:" rows="3" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Create Challan
            </button>
            <button onClick={() => setShowNewChallan(false)} className="px-4 py-2 rounded-lg  dark:bg-slate-600  dark: hover:bg-slate-400 transition-colors">
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Challans Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-left text-sm font-semibold">Challan ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stage/Process</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Vendor</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Items</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChallans.map(challan => (
                <tr key={challan.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors">
                  <td className="p-1 text-sm font-medium">{challan.id}</td>
                  <td className="p-1">
                    <Badge className={getTypeColor(challan.type)}>
                      {challan.type === 'outward' ? (
                        <ArrowUp size={14} className="inline mr-1" />
                      ) : (
                        <ArrowDown size={14} className="inline mr-1" />
                      )}
                      {challan.type.charAt(0).toUpperCase() + challan.type.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{challan.stage}</td>
                  <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{challan.vendor}</td>
                  <td className="p-1 text-sm text-center font-medium">{challan.items}</td>
                  <td className="p-1 text-sm text-slate-700 dark:text-slate-300">
                    {challan.challanDate}
                    {challan.type === 'outward' && ` (Return: ${challan.expectedReturn})`}
                    {challan.type === 'inward' && ` (Received: ${challan.receivedDate})`}
                  </td>
                  <td className="p-1">
                    <Badge className={getStatusColor(challan.status)}>
                      {challan.status.charAt(0).toUpperCase() + challan.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-1">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ChallanTasksPage;
