import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import taskService from "../../utils/taskService";
import useProjectInventoryTask from "../../hooks/useProjectInventoryTask";
import {
  Package,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Loader,
} from "lucide-react";

const ViewStockPage = () => {
  const { completeCurrentTask } = useProjectInventoryTask();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(["all"]);

  useEffect(() => {
    fetchMaterials();
    completeCurrentTask("Stock levels viewed and verified");
  }, [completeCurrentTask]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/inventory/materials");
      const materials = response.data.materials || [];

      const formattedData = materials.map((item) => {
        const quantity = Number(item.quantity) || 0;
        const reorderLevel = Number(item.reorder_level) || 0;

        let status = "optimal";
        if (quantity === 0) {
          status = "critical";
        } else if (quantity < reorderLevel) {
          status = "low";
        }

        return {
          id: item.id,
          name: item.item_name,
          code: item.item_code,
          category: item.category || "Uncategorized",
          quantity: quantity,
          unit: item.unit || "units",
          reorderLevel: reorderLevel,
          status: status,
          location: item.location || "Unknown",
          lastUpdated: new Date(item.created_at).toLocaleDateString(),
          unitCost: item.unit_cost,
        };
      });

      setStockData(formattedData);

      const uniqueCategories = [
        "all",
        ...new Set(formattedData.map((item) => item.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = stockData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "optimal":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "low":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "optimal":
        return <CheckCircle size={16} />;
      case "low":
      case "critical":
        return <AlertTriangle size={16} />;
      default:
        return null;
    }
  };

  const handleExport = () => {
    console.log("Exporting stock data...");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader
            size={48}
            className="text-blue-600 animate-spin mx-auto mb-4"
          />
          <p className="text-slate-600 dark:text-slate-400">
            Loading inventory...
          </p>
        </div>
      </div>
    );
  }

  const optimalCount = stockData.filter(
    (item) => item.status === "optimal"
  ).length;
  const lowCount = stockData.filter((item) => item.status === "low").length;
  const criticalCount = stockData.filter(
    (item) => item.status === "critical"
  ).length;
  const totalQuantity = stockData.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-md font-bold text-slate-900 dark:text-white  flex items-center gap-2">
            <Package size={24} />
            Stock Inventory
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
            Showing {filteredData.length} of {stockData.length} items
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => fetchMaterials()}
            className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search items or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs"
          >
            <option value="name">Sort by Name</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="status">Sort by Status</option>
            <option value="updated">Sort by Last Updated</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              No items found matching your criteria
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    Reorder Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                    Location
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-xs">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Updated {item.lastUpdated}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {item.code}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.category}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {item.quantity}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                        {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-xs text-slate-600 dark:text-slate-400 ">
                      {item.reorderLevel}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-slate-900 dark:text-white">
                      {item.location}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex items-center text-xs gap-1 px-3 py-1 rounded-full font-semibold ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Optimal Stock
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {optimalCount}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Low Stock
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {lowCount}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-red-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Critical Stock
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {criticalCount}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Total Qty
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {totalQuantity.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewStockPage;
