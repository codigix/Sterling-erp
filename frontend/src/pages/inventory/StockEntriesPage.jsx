import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import CreateStockEntryModal from "./CreateStockEntryModal";
import {
  Package,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  Boxes,
  IndianRupee,
  Clock,
  MoreVertical,
  Filter,
} from "lucide-react";

const StockEntriesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStockEntries();
  }, []);

  const fetchStockEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/inventory/stock-entries");
      setEntries(response.data.movements || []);
    } catch (error) {
      console.error("Error fetching stock entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: "TOTAL MOVEMENTS", value: entries.length, icon: TrendingUp, color: "blue" },
    { title: "TOTAL THROUGHPUT", value: "1,600", icon: Boxes, color: "indigo" },
    { title: "INVENTORY VALUE", value: "₹0.02L", icon: IndianRupee, color: "emerald" },
    { title: "PENDING DRAFTS", value: "0", icon: Clock, color: "amber" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-lg`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID, No, or warehouse..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="receipt">Material Receipt</option>
              <option value="issue">Material Issue</option>
              <option value="transfer">Material Transfer</option>
            </select>
            <select 
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              <option value="all">All Warehouses</option>
            </select>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold text-sm whitespace-nowrap"
            >
              <Plus size={18} /> Create Entry
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ENTRY NO</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">TYPE & PURPOSE</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">WAREHOUSE (SOURCE → DEST)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">STATUS</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">DATE</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">ITEMS</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs">
              {entries.map((entry, idx) => {
                const items = Array.isArray(entry.items) ? entry.items : (typeof entry.items === 'string' ? JSON.parse(entry.items) : []);
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white uppercase">{entry.entry_no}</p>
                      <p className="text-slate-500 font-medium">ID: {entry.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded">
                          <Package size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{entry.entry_type}</p>
                          <p className="text-slate-500 font-medium">{entry.remarks || 'Stock transaction'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3 font-medium">
                        <span className="text-slate-400 italic">{entry.from_warehouse || 'N/A'}</span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span className="text-slate-900 dark:text-white font-bold">{entry.to_warehouse || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-bold uppercase tracking-tight">
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                      {new Date(entry.entry_date || entry.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
                      {items.length}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">
                    No stock entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateStockEntryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onEntryCreated={fetchStockEntries}
      />
    </div>
  );
};

export default StockEntriesPage;
