import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import {
  Search,
  Calendar,
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  Trash2,
  FileText,
  Loader,
} from "lucide-react";
import CreateStockEntryModal from "./CreateStockEntryModal";

import toastUtils from "../../utils/toastUtils";

const StockMovementsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStockMovements();
  }, []);

  const fetchStockMovements = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/inventory/stock-entries");
      // Transform stock entries into ledger movements
      const entries = response.data.movements || [];
      const ledgerMovements = [];

      entries.forEach(entry => {
        const items = Array.isArray(entry.items) ? entry.items : (typeof entry.items === 'string' ? JSON.parse(entry.items) : (entry.items || []));
        items.forEach(item => {
          ledgerMovements.push({
            id: `${entry.id}-${item.material_id}-${Math.random()}`,
            item_code: item.item_code || item.material_code || "N/A",
            material_name: item.item_name || item.material_name || "N/A",
            material_type: "RAW_MATERIAL", 
            date: entry.entry_date ? new Date(entry.entry_date).toLocaleDateString("en-GB") : "N/A",
            type: entry.entry_type === 'Material Receipt' ? 'IN' : 'OUT',
            quantity: item.quantity,
            uom: item.unit || item.uom || "Nos",
            balance: 0, 
            reference_no: entry.entry_no,
            reference_type: "STOCK_ENTRY",
            remarks: entry.remarks || `Receipt into ${entry.to_warehouse || 'Warehouse'}`
          });
        });
      });

      setMovements(ledgerMovements);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      toastUtils.error("Failed to load stock movements");
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = movements.filter((m) => {
    const matchesSearch = 
      (m.item_code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.material_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size={48} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">View and manage stock transactions</p>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Stock Ledger</h2>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Item Code</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Enter item code"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full lg:w-48 space-y-2 text-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Start Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full lg:w-48 space-y-2 text-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">End Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
              <Filter size={18} /> Filter
            </button>
            <button 
              onClick={fetchStockMovements}
              className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm whitespace-nowrap"
            >
              <Plus size={20} /> Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Code</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Material</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Quantity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredMovements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-5 text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {m.item_code}
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{m.material_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{m.material_type}</p>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    {m.uom}
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    {m.date}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded font-bold text-[10px] ${
                      m.type === 'IN' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' 
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                    }`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-xs">
                    <span className={m.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}>
                      {m.type === 'IN' ? '+' : '-'}{Number(m.quantity).toFixed(3)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-xs text-slate-900 dark:text-white">
                    {m.balance.toFixed(3)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-[9px] font-bold text-slate-500 w-fit">
                        <span className="opacity-60">{m.reference_type}:</span> {m.reference_no}
                      </div>
                      <p className="text-[10px] text-slate-400 italic font-medium ml-1 truncate max-w-[150px]">
                        {m.remarks}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileText size={40} className="opacity-20" />
                      <p className="text-sm font-medium">No ledger entries found</p>
                    </div>
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
        onEntryCreated={fetchStockMovements}
      />
    </div>
  );
};

export default StockMovementsPage;
