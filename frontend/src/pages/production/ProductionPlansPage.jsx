import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Zap,
  ChevronDown,
} from "lucide-react";
import axios from "../../utils/api";

const ProductionPlansPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [readyItems, setReadyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readyLoading, setReadyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);
  const [openPhaseDropdown, setOpenPhaseDropdown] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchReadyForProduction();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenPhaseDropdown(null);
    };
    if (openPhaseDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openPhaseDropdown]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/production/plans", { __sessionGuard: true });
      setPlans(response.data.plans || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.message || "Failed to fetch production plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReadyForProduction = async () => {
    try {
      setReadyLoading(true);
      const response = await axios.get("/production/ready-for-production", { __sessionGuard: true });
      setReadyItems(response.data?.data?.readyItems || []);
    } catch (err) {
      console.error("Error fetching ready items:", err);
    } finally {
      setReadyLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    
    try {
      setDeleting(id);
      await axios.delete(`/production/plans/${id}`, { __sessionGuard: true });
      setPlans(plans.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting plan:", err);
      alert("Failed to delete plan");
    } finally {
      setDeleting(null);
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      (plan.plan_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || plan.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const stats = [
    {
      label: "Total Plans",
      value: plans.length,
      color: "text-blue-600",
    },
    {
      label: "In Progress",
      value: plans.filter((p) => p.status === "in_progress").length,
      color: "text-blue-600",
    },
    {
      label: "Completed",
      value: plans.filter((p) => p.status === "completed").length,
      color: "text-green-600",
    },
    {
      label: "Draft",
      value: plans.filter((p) => p.status === "draft").length,
      color: "text-slate-600",
    },
  ];

  return (
    <div className="space-y-8 p-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Production Plans
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage production plans and track progress
          </p>
        </div>
        <button
          onClick={() => navigate("/department/production/plans/new")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={20} />
          New Plan
        </button>
      </div>

      {readyItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={24} className="text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">
              Ready for Production
            </h2>
            <span className="ml-auto bg-amber-600 dark:bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {readyItems.length}
            </span>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
            The following sales orders have production phases defined and are ready to start production planning.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-amber-300 dark:border-amber-700 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="mb-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.orderNumber}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.customerName}</p>
                  {item.projectName && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {item.projectCode ? `${item.projectCode}: ` : ''}{item.projectName}
                    </p>
                  )}
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Selected Phases:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(item.selectedPhases).map((phase) => (
                      <span
                        key={phase}
                        className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                      >
                        {phase}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => navigate("/department/production/plans/new", { state: { salesOrderId: item.id } })}
                  className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Create Production Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by plan name or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="planning">Planning</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-200 border-b-blue-600 mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">
                Loading production plans...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              No production plans found
            </p>
          </div>
        )}

        {!loading && !error && filteredPlans.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Plan Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Timeline
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Production Phases
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {plan.plan_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {plan.customer_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {plan.planned_start_date ? new Date(plan.planned_start_date).toLocaleDateString() : "-"} to{" "}
                      {plan.planned_end_date ? new Date(plan.planned_end_date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm relative">
                      {plan.phases && plan.phases.length > 0 ? (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPhaseDropdown(openPhaseDropdown === plan.id ? null : plan.id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-lg transition-colors"
                          >
                            <span className="text-xs font-medium">{plan.phases.length} phases</span>
                            <ChevronDown size={16} className={`transform transition-transform ${openPhaseDropdown === plan.id ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {openPhaseDropdown === plan.id && (
                            <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-max">
                              {plan.phases.map((phase, idx) => (
                                <div key={idx} className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                    {phase.stage_name}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    ({phase.stage_type || 'production'})
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 italic">No phases defined</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          plan.status
                        )}`}
                      >
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1).replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/department/production/plans/${plan.id}`)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        >
                          <Eye
                            size={16}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          disabled={deleting === plan.id}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2
                            size={16}
                            className="text-red-600 dark:text-red-400"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionPlansPage;
