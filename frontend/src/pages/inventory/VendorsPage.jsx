import React, { useState } from 'react';
import {
  Truck,
  Search,
  Plus,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Star,
  Edit,
  Trash2,
  TrendingUp,
} from 'lucide-react';

const VendorsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  const vendorsData = [
    { id: 1, name: 'Vendor A', category: 'Raw Materials', email: 'vendor.a@company.com', phone: '+91-9876543210', location: 'Mumbai, Maharashtra', rating: 4.8, totalOrders: 45, lastOrder: '2024-12-10', status: 'active', totalValue: '₹5,50,000' },
    { id: 2, name: 'Vendor B', category: 'Components', email: 'vendor.b@company.com', phone: '+91-9876543211', location: 'Delhi, NCR', rating: 4.5, totalOrders: 32, lastOrder: '2024-12-08', status: 'active', totalValue: '₹3,25,000' },
    { id: 3, name: 'Vendor C', category: 'Paint & Chemicals', email: 'vendor.c@company.com', phone: '+91-9876543212', location: 'Bangalore, Karnataka', rating: 4.2, totalOrders: 28, lastOrder: '2024-12-12', status: 'active', totalValue: '₹2,10,000' },
    { id: 4, name: 'Vendor D', category: 'Packaging', email: 'vendor.d@company.com', phone: '+91-9876543213', location: 'Chennai, Tamil Nadu', rating: 3.8, totalOrders: 18, lastOrder: '2024-11-25', status: 'inactive', totalValue: '₹1,45,000' },
    { id: 5, name: 'Vendor E', category: 'Raw Materials', email: 'vendor.e@company.com', phone: '+91-9876543214', location: 'Ahmedabad, Gujarat', rating: 4.6, totalOrders: 25, lastOrder: '2024-12-14', status: 'active', totalValue: '₹2,80,000' },
    { id: 6, name: 'Vendor F', category: 'Components', email: 'vendor.f@company.com', phone: '+91-9876543215', location: 'Pune, Maharashtra', rating: 4.3, totalOrders: 22, lastOrder: '2024-12-09', status: 'active', totalValue: '₹1,95,000' },
  ];

  const filteredData = vendorsData.filter(vendor =>
    (vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     vendor.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (ratingFilter === 'all' || (ratingFilter === '4+' ? vendor.rating >= 4 : ratingFilter === '3+' ? vendor.rating >= 3 : true))
  );

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center text-xs gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < fullStars ? 'fill-yellow-400 text-yellow-400' : hasHalfStar && i === fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{rating}</span>
      </div>
    );
  };

  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center text-xs gap-2">
            <Truck size={24} />
            Vendor Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and track vendor relationships
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            Add Vendor
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export List
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Vendors</option>
            <option value="4+">Rating 4+ Stars</option>
            <option value="3+">Rating 3+ Stars</option>
          </select>

          <button className="flex items-center text-xs justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter size={18} />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.map(vendor => (
          <div key={vendor.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{vendor.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{vendor.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.status)}`}>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </span>
            </div>

            <div className="mb-4">
              {renderStars(vendor.rating)}
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center text-xs gap-2 text-slate-600 dark:text-slate-400">
                <Mail size={16} />
                <a href={`mailto:${vendor.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">{vendor.email}</a>
              </div>
              <div className="flex items-center text-xs gap-2 text-slate-600 dark:text-slate-400">
                <Phone size={16} />
                <a href={`tel:${vendor.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">{vendor.phone}</a>
              </div>
              <div className="flex items-center text-xs gap-2 text-slate-600 dark:text-slate-400">
                <MapPin size={16} />
                <span>{vendor.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg mb-4">
              <div className="text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">Total Orders</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{vendor.totalOrders}</p>
              </div>
              <div className="text-center border-l border-r border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-600 dark:text-slate-400">Total Value</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white text-sm">{vendor.totalValue}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">Last Order</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{vendor.lastOrder.split('-')[2]}/{vendor.lastOrder.split('-')[1]}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center text-xs justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm">
                <Edit size={16} />
                Edit
              </button>
              <button className="flex-1 flex items-center text-xs justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm">
                <TrendingUp size={16} />
                Performance
              </button>
              <button className="px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vendor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Vendors</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{filteredData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Active Vendors</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(v => v.status === 'active').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Avg. Rating</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {(filteredData.reduce((sum, v) => sum + v.rating, 0) / filteredData.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-purple-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Orders</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.reduce((sum, v) => sum + v.totalOrders, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;
