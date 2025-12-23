import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  MapPin,
  Calendar,
  Package,
  CheckCircle,
} from 'lucide-react';

const TrackChallanPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const challanTracking = [
    { id: 1, challanNo: 'CHLN-001-2025', customer: 'Client A', quantity: 300, generatedDate: '2025-12-16', currentLocation: 'Warehouse', lastUpdate: '2025-12-16 14:30', expectedDelivery: '2025-12-20', progress: 100, status: 'delivered' },
    { id: 2, challanNo: 'CHLN-002-2025', customer: 'Client B', quantity: 150, generatedDate: '2025-12-15', currentLocation: 'In Transit - Route 5', lastUpdate: '2025-12-16 10:15', expectedDelivery: '2025-12-19', progress: 65, status: 'in-transit' },
    { id: 3, challanNo: 'CHLN-003-2025', customer: 'Client D', quantity: 350, generatedDate: '2025-12-14', currentLocation: 'Quality Check', lastUpdate: '2025-12-16 09:00', expectedDelivery: '2025-12-21', progress: 35, status: 'processing' },
    { id: 4, challanNo: 'CHLN-004-2025', customer: 'Client C', quantity: 200, generatedDate: '2025-12-13', currentLocation: 'Delivered at Destination', lastUpdate: '2025-12-17 16:45', expectedDelivery: '2025-12-17', progress: 100, status: 'delivered' },
  ];

  const filteredChallans = challanTracking.filter(challan =>
    challan.challanNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challan.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Track Challan</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track the delivery status of all challans in real-time</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search challan number or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
      </div>

      <div className="space-y-6">
        {filteredChallans.map((challan) => (
          <div key={challan.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{challan.challanNo}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{challan.customer}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(challan.status)}`}>
                  {challan.status.charAt(0).toUpperCase() + challan.status.slice(1).replace('-', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Quantity</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{challan.quantity} units</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Generated</p>
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white">{challan.generatedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Expected Delivery</p>
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white">{challan.expectedDelivery}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Last Update</p>
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white">{challan.lastUpdate}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center text-xs gap-3 mb-3">
                  <MapPin size={20} className="text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Current Location</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{challan.currentLocation}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center text-xs justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Delivery Progress</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{challan.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${challan.progress}%` }}></div>
                </div>
              </div>

              {challan.status === 'delivered' && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center text-xs gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Delivered successfully on {challan.expectedDelivery}
                  </p>
                </div>
              )}

              {challan.status === 'in-transit' && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Expected to arrive on {challan.expectedDelivery}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackChallanPage;
