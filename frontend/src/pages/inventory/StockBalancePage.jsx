import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import {
  Package,
  Search,
  Filter,
  Download,
  Trash2,
  Loader,
  Calculator,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";

import toastUtils from "../../utils/toastUtils";

const StockBalancePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/inventory/materials?onlyWithStock=true");
      const materials = response.data.materials || [];

      const formattedData = materials.map((item) => {
        // Safe date formatting
        const formatDate = (dateValue) => {
          if (!dateValue || dateValue === "0000-00-00" || dateValue.startsWith("0000")) return "N/A";
          const d = new Date(dateValue);
          return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-GB");
        };

        return {
          id: item.id,
          name: String(item.itemName || item.item_name || item.description || item.name || "N/A").trim() || "N/A",
          code: String(item.itemCode || item.item_code || item.item_no || item.code || "N/A").trim() || "N/A",
          category: item.category || "Uncategorized",
          quantity: Number(item.total_stock !== undefined ? item.total_stock : (item.quantity !== undefined ? item.quantity : 0)) || 0,
          unit: item.unit || item.uom || "Nos",
          reorderLevel: Number(item.reorderLevel || item.reorder_level) || 0,
          lastUpdated: formatDate(item.updatedAt || item.createdAt || item.last_updated),
          type: item.material_type || item.category || "RAW_MATERIAL",
        };
      });

      setStockData(formattedData);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toastUtils.error("Failed to load stock balance");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      const result = await axios.delete(`/inventory/materials/${id}`);
      toastUtils.success("Material record removed");
      fetchMaterials();
    } catch (error) {
      toastUtils.error("Failed to delete material");
    }
  };

  const filteredData = stockData.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size={48} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  const totalItems = stockData.length;
  const totalBalance = stockData.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = stockData.filter(item => item.quantity < item.reorderLevel || item.quantity === 0).length;

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Items</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalItems}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Package size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Balance</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalBalance.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Calculator size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{lowStockItems}</h3>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by item code or description..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                    Item Code <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                    Material Name <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                    Material Type <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {item.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.quantity <= item.reorderLevel ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <span className={`text-sm font-bold ${item.quantity <= item.reorderLevel ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                        {item.quantity.toFixed(3)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.lastUpdated}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteMaterial(item.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              No materials found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockBalancePage;
