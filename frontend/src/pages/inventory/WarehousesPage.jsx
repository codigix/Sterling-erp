import React, { useState, useEffect, useCallback } from "react";
import {
  Warehouse,
  Search,
  Plus,
  RefreshCw,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Clock,
  LayoutGrid,
  List,
  Download,
  X,
  MapPin,
  Database,
  Layers,
  Building2
} from "lucide-react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import toastUtils from "../../utils/toastUtils";

const WarehousesPage = () => {
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [showModal, setShowModal] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "Raw Material",
    department: "All Departments",
    location: "",
    storage_capacity: "",
    parent_warehouse_id: ""
  });

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/inventory/warehouses");
      setWarehouses(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleOpenModal = (warehouse = null) => {
    if (warehouse) {
      setEditingId(warehouse.id);
      setFormData({
        code: warehouse.code || "",
        name: warehouse.name || "",
        type: warehouse.type || "Raw Material",
        department: warehouse.department || "All Departments",
        location: warehouse.location || "",
        storage_capacity: warehouse.storage_capacity || "",
        parent_warehouse_id: warehouse.parent_warehouse_id || ""
      });
    } else {
      setEditingId(null);
      setFormData({
        code: "",
        name: "",
        type: "Raw Material",
        department: "All Departments",
        location: "",
        storage_capacity: "",
        parent_warehouse_id: ""
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/inventory/warehouses/${editingId}`, formData);
        toastUtils.success("Warehouse updated successfully");
      } else {
        await axios.post("/inventory/warehouses", formData);
        toastUtils.success("Warehouse created successfully");
      }
      setShowModal(false);
      fetchWarehouses();
    } catch (error) {
      console.error("Error saving warehouse:", error);
      toastUtils.error(error.response?.data?.message || "Failed to save warehouse");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/inventory/warehouses/${id}`);
        toastUtils.success("Warehouse has been deleted.");
        fetchWarehouses();
      } catch (error) {
        console.error("Error deleting warehouse:", error);
        toastUtils.error("Failed to delete warehouse");
      }
    }
  };

  const filteredWarehouses = warehouses.filter(wh => {
    const matchesSearch = 
      wh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wh.location && wh.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = locationFilter === "All Locations" || wh.location === locationFilter;
    
    return matchesSearch && matchesLocation;
  });

  const locations = ["All Locations", ...new Set(warehouses.map(wh => wh.location).filter(Boolean))];

  return (
    <div className="p-6 bg-slate-50 min-h-screen dark:bg-slate-900">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <Warehouse className="text-amber-600 dark:text-amber-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Warehouses</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage storage locations and inventory warehouses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchWarehouses}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={18} />
            Create Warehouse
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, code, or location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <select
              className="w-full appearance-none pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-600 dark:text-slate-300"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-amber-50 text-amber-600" : "text-slate-400"}`}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-amber-50 text-amber-600" : "text-slate-400"}`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50">
            <LayoutGrid size={18} />
            Columns
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-amber-600" size={32} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white uppercase">{wh.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{wh.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{wh.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{wh.location}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{wh.storage_capacity}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(wh)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(wh.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">No warehouses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <Warehouse className="text-amber-600 dark:text-amber-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit Warehouse" : "Create New Warehouse"}
                </h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Warehouse Code *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., WH001"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Warehouse Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Main Warehouse"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Warehouse Type *
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option>Raw Material</option>
                    <option>Finished Goods</option>
                    <option>WIP</option>
                    <option>Scrap</option>
                    <option>Stores</option>
                    <option>Transit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Department *
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  >
                    <option>All Departments</option>
                    <option>Production</option>
                    <option>Purchase</option>
                    <option>Stores</option>
                    <option>Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mumbai"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Storage Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 1000"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.storage_capacity}
                    onChange={(e) => setFormData({...formData, storage_capacity: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Parent Warehouse ID
                  </label>
                  <input
                    type="number"
                    placeholder="Leave empty if no parent"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.parent_warehouse_id}
                    onChange={(e) => setFormData({...formData, parent_warehouse_id: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm"
                >
                  {editingId ? "Update Warehouse" : "Create Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;
