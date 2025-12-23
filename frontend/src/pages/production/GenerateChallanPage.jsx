import React, { useState } from 'react';
import {
  CheckCircle,
  Plus,
  Download,
  Eye,
  Printer,
  Calendar,
} from 'lucide-react';

const GenerateChallanPage = () => {
  const [formData, setFormData] = useState({
    planNo: '',
    projectCode: '',
    customer: '',
    quantity: '',
    description: '',
    dueDate: '',
  });

  const recentChallans = [
    { id: 1, challanNo: 'CHLN-001-2025', planNo: 'PP-001-2025', quantity: 300, status: 'generated', date: '2025-12-16', customer: 'Client A' },
    { id: 2, challanNo: 'CHLN-002-2025', planNo: 'PP-002-2025', quantity: 150, status: 'generated', date: '2025-12-15', customer: 'Client B' },
    { id: 3, challanNo: 'CHLN-003-2025', planNo: 'PP-004-2025', quantity: 350, status: 'generated', date: '2025-12-14', customer: 'Client D' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    alert('Challan generated successfully!');
    setFormData({ planNo: '', projectCode: '', customer: '', quantity: '', description: '', dueDate: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Generate Challan</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create new delivery challans for completed production</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-6">New Challan Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Production Plan No. *
                </label>
                <select
                  name="planNo"
                  value={formData.planNo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select a plan</option>
                  <option value="PP-001-2025">PP-001-2025 (Project Alpha)</option>
                  <option value="PP-002-2025">PP-002-2025 (Project Beta)</option>
                  <option value="PP-003-2025">PP-003-2025 (Project Gamma)</option>
                  <option value="PP-004-2025">PP-004-2025 (Project Delta)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Project Code
                  </label>
                  <input
                    type="text"
                    name="projectCode"
                    value={formData.projectCode}
                    onChange={handleChange}
                    placeholder="PROJ-001"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    placeholder="Client Name"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Quantity to Dispatch *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="500"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description / Remarks
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product details..."
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleGenerate}
                className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center text-xs justify-center gap-2"
              >
                <CheckCircle size={20} />
                Generate Challan
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Challans</h3>
          <div className="space-y-3">
            {recentChallans.map((challan) => (
              <div key={challan.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{challan.challanNo}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{challan.date}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded">
                      <Eye size={14} className="text-blue-600 dark:text-blue-400" />
                    </button>
                    <button className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded">
                      <Printer size={14} className="text-green-600 dark:text-green-400" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{challan.planNo}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{challan.quantity} units</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateChallanPage;
