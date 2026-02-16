import { useState, useCallback, useEffect } from "react";
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
  X,
} from "lucide-react";
import axios from "../../utils/api";
import toastUtils from "../../utils/toastUtils";

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    vendor_type: "material_supplier",
    rating: "",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (ratingFilter !== "all") {
        if (ratingFilter === "4+") params.append("minRating", "4");
        else if (ratingFilter === "3+") params.append("minRating", "3");
      }

      const response = await axios.get(
        `inventory/vendors?${params}`
      );
      setVendors(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, ratingFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`inventory/vendors/stats`);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `inventory/vendors/categories`
      );
      const categoryData = response.data
        .map((cat) => cat.category)
        .filter(Boolean);
      setCategories(categoryData);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  const fetchVendorById = useCallback(
    async (id) => {
      try {
        const response = await axios.get(`inventory/vendors/${id}`);
        return response.data;
      } catch (err) {
        console.error("Error fetching vendor:", err);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    fetchVendors();
    fetchStats();
    fetchCategories();
  }, [fetchVendors, fetchStats, fetchCategories]);

  const handleDeleteVendor = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await axios.delete(`inventory/vendors/${id}`);
        toastUtils.success("Vendor deleted successfully");
        fetchVendors();
      } catch (err) {
        console.error("Error deleting vendor:", err);
        toastUtils.error("Failed to delete vendor");
      }
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleRatingFilter = (value) => {
    setRatingFilter(value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toastUtils.warning("Vendor name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
      };

      await axios.post(`inventory/vendors`, payload);

      setShowAddModal(false);
      setFormData({
        name: "",
        contact: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        vendor_type: "material_supplier",
        rating: "",
        status: "active",
      });

      fetchVendors();
      fetchStats();
      toastUtils.success("Vendor added successfully");
    } catch (err) {
      console.error("Error adding vendor:", err);
      toastUtils.error("Failed to add vendor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVendor = async (vendor) => {
    const vendorData = await fetchVendorById(vendor.id);
    if (vendorData) {
      setEditingVendor(vendorData);
      setFormData({
        name: vendorData.name || "",
        contact: vendorData.contact || "",
        email: vendorData.email || "",
        phone: vendorData.phone || "",
        address: vendorData.address || "",
        category: vendorData.category || "",
        vendor_type: vendorData.vendor_type || "material_supplier",
        rating: vendorData.rating || "",
        status: vendorData.status || "active",
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateVendor = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toastUtils.warning("Vendor name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
      };

      await axios.put(
        `inventory/vendors/${editingVendor.id}`,
        payload
      );

      setShowEditModal(false);
      setEditingVendor(null);
      setFormData({
        name: "",
        contact: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        vendor_type: "material_supplier",
        rating: "",
        status: "active",
      });

      fetchVendors();
      fetchStats();
      toastUtils.success("Vendor updated successfully");
    } catch (err) {
      console.error("Error updating vendor:", err);
      toastUtils.error("Failed to update vendor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowPerformance = async (vendor) => {
    const vendorData = await fetchVendorById(vendor.id);
    if (vendorData) {
      setSelectedVendor(vendorData);
      setShowPerformanceModal(true);
    }
  };

  const renderStars = (rating) => {
    const numRating = parseFloat(rating);
    if (!rating || isNaN(numRating))
      return (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          No rating
        </span>
      );
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    return (
      <div className="flex items-center text-xs gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : hasHalfStar && i === fullStars
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
          {numRating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const formatCurrency = (value) => {
    if (!value) return "₹0";
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-md font-bold text-slate-900 dark:text-white text-xs flex items-center  gap-2">
            <Truck size={24} />
            Vendor Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
            Manage and track vendor relationships
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center text-xs gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
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
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search vendor or category..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => handleRatingFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs"
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
        {loading ? (
          <div className="col-span-2 flex justify-center items-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              Loading vendors...
            </p>
          </div>
        ) : error ? (
          <div className="col-span-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              No vendors found
            </p>
          </div>
        ) : (
          vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs">
                    {vendor.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {vendor.category || "No category"}
                    </span>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded capitalize">
                      {(vendor.vendor_type || "material_supplier").replace(
                        /_/g,
                        " "
                      )}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    vendor.status
                  )}`}
                >
                  {vendor.status.charAt(0).toUpperCase() +
                    vendor.status.slice(1)}
                </span>
              </div>

              <div className="mb-4">{renderStars(vendor.rating)}</div>

              <div className="space-y-2 mb-4 text-sm">
                {vendor.email && (
                  <div className="flex items-center text-xs gap-2 text-slate-600 dark:text-slate-400">
                    <Mail size={16} />
                    <a
                      href={`mailto:${vendor.email}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {vendor.email}
                    </a>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center text-xs gap-2 text-slate-600 dark:text-slate-400">
                    <Phone size={16} />
                    <a
                      href={`tel:${vendor.phone}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {vendor.phone}
                    </a>
                  </div>
                )}
                {vendor.address && (
                  <div className="flex items-center text-xs gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin size={16} />
                    <span>{vendor.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Total Orders
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white text-xs">
                    {vendor.total_orders || 0}
                  </p>
                </div>
                <div className="text-center border-l border-r border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Total Value
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white text-xs">
                    {formatCurrency(vendor.total_value)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Last Order
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white text-xs">
                    {formatDate(vendor.last_order_date)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditVendor(vendor)}
                  className="flex-1 flex items-center text-xs justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleShowPerformance(vendor)}
                  className="flex-1 flex items-center text-xs justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                >
                  <TrendingUp size={16} />
                  Performance
                </button>
                <button
                  onClick={() => handleDeleteVendor(vendor.id)}
                  className="px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vendor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Total Vendors
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {stats.total || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Active Vendors
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {stats.active_count || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Avg. Rating
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : "0"}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-purple-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Total Orders
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {stats.total_orders_sum || 0}
          </p>
        </div>
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-800 flex justify-between items-center px-8 py-6 border-b border-slate-200 dark:border-slate-600">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-xs">
                  Add New Vendor
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-xs">
                  Fill in the vendor details below
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleAddVendor}
              className="overflow-y-auto flex-1 px-8 py-6"
            >
              {/* Basic Information */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide mb-4">
                  Basic Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Enter vendor name"
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleFormChange}
                      placeholder="Contact person name"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        placeholder="e.g., Electronics"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Vendor Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="vendor_type"
                        value={formData.vendor_type}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="material_supplier">
                          Material Supplier
                        </option>
                        <option value="manufacturer">Manufacturer</option>
                        <option value="outsourcing_partner">
                          Outsourcing Partner
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide mb-4">
                  Contact Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="vendor@example.com"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="+91 XXXXXXXXXX"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="Enter vendor address"
                      rows="3"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide mb-4">
                  Performance
                </h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Initial Rating (0-5)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleFormChange}
                      placeholder="0.0"
                      min="0"
                      max="5"
                      step="0.1"
                      className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={
                            i < Math.floor(formData.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleAddVendor}
                disabled={submitting}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {submitting ? "Adding Vendor..." : "Add Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingVendor && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-800 flex justify-between items-center px-8 py-6 border-b border-slate-200 dark:border-slate-600">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-xs">
                  Edit Vendor
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-xs">
                  Update vendor information
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleUpdateVendor}
              className="overflow-y-auto flex-1 px-8 py-6"
            >
              {/* Basic Information */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide mb-4">
                  Basic Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Enter vendor name"
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleFormChange}
                      placeholder="Contact person name"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        placeholder="e.g., Electronics"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Vendor Type
                      </label>
                      <select
                        name="vendor_type"
                        value={formData.vendor_type}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="material_supplier">
                          Material Supplier
                        </option>
                        <option value="manufacturer">Manufacturer</option>
                        <option value="outsourcing_partner">
                          Outsourcing Partner
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide mb-4">
                  Contact Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="vendor@example.com"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="+91 XXXXXXXXXX"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="Enter vendor address"
                      rows="3"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide mb-4">
                  Performance
                </h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Rating (0-5)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleFormChange}
                      placeholder="0.0"
                      min="0"
                      max="5"
                      step="0.1"
                      className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={
                            i < Math.floor(formData.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleUpdateVendor}
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {submitting ? "Updating..." : "Update Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPerformanceModal && selectedVendor && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPerformanceModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-slate-700 dark:to-slate-800 flex justify-between items-center px-8 py-6 border-b border-slate-200 dark:border-slate-600">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-xs">
                  {selectedVendor.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-xs">
                  Performance Metrics
                </p>
              </div>
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 border border-blue-200 dark:border-slate-600">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white text-xs mt-2">
                    {selectedVendor.total_orders || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 border border-green-200 dark:border-slate-600">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Total Value
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white text-xs mt-2">
                    {formatCurrency(selectedVendor.total_value)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 border border-yellow-200 dark:border-slate-600">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Rating
                  </p>
                  <div className="mt-3">
                    {renderStars(selectedVendor.rating)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 border border-purple-200 dark:border-slate-600">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Status
                  </p>
                  <p
                    className={`text-sm font-bold mt-2 ${
                      selectedVendor.status === "active"
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {selectedVendor.status.charAt(0).toUpperCase() +
                      selectedVendor.status.slice(1)}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide mb-4">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  {selectedVendor.email && (
                    <div className="flex items-center gap-3">
                      <Mail
                        size={18}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      <a
                        href={`mailto:${selectedVendor.email}`}
                        className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {selectedVendor.email}
                      </a>
                    </div>
                  )}
                  {selectedVendor.phone && (
                    <div className="flex items-center gap-3">
                      <Phone
                        size={18}
                        className="text-green-600 dark:text-green-400"
                      />
                      <a
                        href={`tel:${selectedVendor.phone}`}
                        className="text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400"
                      >
                        {selectedVendor.phone}
                      </a>
                    </div>
                  )}
                  {selectedVendor.address && (
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        className="text-orange-600 dark:text-orange-400 mt-1"
                      />
                      <p className="text-slate-700 dark:text-slate-300">
                        {selectedVendor.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex justify-end">
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
