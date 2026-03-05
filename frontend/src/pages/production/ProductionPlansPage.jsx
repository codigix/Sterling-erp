import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Plus,
  ChevronRight,
  AlertCircle,
  FileText,
  ClipboardList,
  Trash2,
  CheckCircle2,
  Edit2,
  Layers,
  Zap,
  Settings,
  Eye,
  MapPin,
  Activity,
  ArrowLeft,
  BarChart2,
  Send,
  Bell,
  Box,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { showSuccess, showError } from "../../utils/toastUtils";
import MaterialRequestModal from "../../components/production/MaterialRequestModal";
import MaterialRequestTraceabilityModal from "../../components/production/MaterialRequestTraceabilityModal";

// --- Main Component ---
const ProductionPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({
    total_plans: 0,
    in_progress_plans: 0,
    completed_plans: 0,
    draft_plans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMaterialRequestModal, setShowMaterialRequestModal] = useState(false);
  const [showTraceabilityModal, setShowTraceabilityModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedPlanName, setSelectedPlanName] = useState(null);
  const [selectedPlanData, setSelectedPlanData] = useState(null);
  const [selectedPlanMaterials, setSelectedPlanMaterials] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const salesOrderId = params.get("salesOrderId");
    const taskId = params.get("taskId");
    const openMaterialRequest = params.get("openMaterialRequest");

    if (salesOrderId && !openMaterialRequest) {
      // If we have a salesOrderId in the URL, redirect to create a new plan for it
      navigate(`/department/production/plans/new?salesOrderId=${salesOrderId}${taskId ? `&taskId=${taskId}` : ''}`);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const salesOrderId = params.get("salesOrderId");
    const openMaterialRequest = params.get("openMaterialRequest");
    const openWorkOrder = params.get("openWorkOrder");

    if (openMaterialRequest === "true" && salesOrderId && plans.length > 0) {
      // Find the plan for this sales order (it might be in root_card_id or sales_order_id field)
      const plan = plans.find(p => p.sales_order_id == salesOrderId || p.root_card_id == salesOrderId);
      if (plan) {
        handleSendMaterialRequest(plan.id);
        // Clear the query params after opening the modal
        navigate("/department/production/plans", { replace: true });
      }
    }

    if (openWorkOrder === "true" && salesOrderId && plans.length > 0) {
      // Find the plan for this sales order
      const plan = plans.find(p => p.sales_order_id == salesOrderId || p.root_card_id == salesOrderId);
      if (plan) {
        handleGenerateWorkOrders(plan.id);
        // Clear the query params
        navigate("/department/production/plans", { replace: true });
      }
    }
  }, [location.search, plans, navigate]);

  useEffect(() => {
    fetchPlans();
    fetchStats();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/production/plans");
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error("Error fetching production plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/production/plans/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching production stats:", error);
    }
  };

  const handleDeletePlan = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        container: "z-[10000]",
      },
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/production/plans/${id}`);
        showSuccess("Plan has been deleted.");
        fetchPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
        showError("Failed to delete the plan.");
      }
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "approved":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "planning":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800";
    }
  };

  const handleCreateNew = () => {
    navigate("/department/production/plans/new");
  };

  const handleGenerateWorkOrders = async (planId) => {
    try {
      const response = await axios.post(`/production/plans/${planId}/generate-work-orders`);
      showSuccess(response.data.message || "Work orders generated successfully");
      fetchPlans();
    } catch (error) {
      console.error("Error generating work orders:", error);
      showError(error.response?.data?.message || "Failed to generate work orders");
    }
  };

  const handleViewTraceability = (planId, planName) => {
    setSelectedPlanId(planId);
    setSelectedPlanName(planName);
    setShowTraceabilityModal(true);
  };

  const handleSendMaterialRequest = async (planId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/production/plans/${planId}/with-stages`);
      const plan = response.data;
      
      console.log('--- ProductionPlansPage Debug ---');
      console.log('Plan fetched:', plan);
      
      setSelectedPlanData({
        planId: plan.id,
        salesOrderId: plan.sales_order_id,
        rootCardId: plan.root_card_id,
        // Ensure both field names are present for compatibility with the modal's logic
        sales_order_id: plan.sales_order_id,
        root_card_id: plan.root_card_id,
        estimatedCompletionDate: plan.estimated_completion_date,
        planName: plan.plan_name
      });
      setSelectedPlanMaterials(plan.materials || []);
      setShowMaterialRequestModal(true);
    } catch (error) {
      console.error("Error fetching plan details for material request:", error);
      showError(error.response?.data?.message || "Failed to fetch plan details");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      (plan.plan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.product_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || plan.status === statusFilter),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 dark:bg-purple-500 rounded-xl text-white shadow-lg shadow-purple-600/20">
              <Layers size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider rounded">
                  Intelligence Module
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Manufacturing Pipeline
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Production Intelligence
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-800 transition-all text-sm"
              onClick={() => {
                fetchPlans();
                showSuccess("Cache reset successfully");
              }}
            >
              <Trash2 size={16} />
              Reset Cache
            </button>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all text-sm"
            >
              <Plus size={18} />
              New Strategic Plan
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Total Plans
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats.total_plans || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  In Progress
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats.in_progress_plans || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Completed
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats.completed_plans || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-xl group-hover:scale-110 transition-transform">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Draft Plans
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats.draft_plans || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Controls */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search plans or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <Filter size={16} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-400 outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="planning">Planning</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <ClipboardList size={20} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Manufacturing Strategy Pipeline
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {filteredPlans.length} active plans
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-100 border-b-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium text-slate-500">
                Syncing Pipeline Data...
              </p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No Plans Found
              </h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Try adjusting your search filters or create a new plan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-medium text-slate-400">
                      Plan ID
                    </th>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400">
                      Origin & Status
                    </th>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400">
                      Timeline
                    </th>
                    <th className="px-6 py-4 text-xs font-medium text-slate-400">
                      Production Progress
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-400">
                      Operations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredPlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 text-white rounded-lg flex items-center justify-center">
                            <Layers size={16} />
                          </div>
                          <div 
                            className="cursor-pointer"
                            onClick={() => navigate(`/department/production/plans/${plan.plan_name || plan.id}`, { state: { viewMode: true } })}
                          >
                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {plan.plan_name}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500 truncate max-w-[250px] mt-0.5">
                              {plan.product_name || "Product Name Not Set"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={12} className="text-slate-400" />
                            <span>Global Manufacturing</span>
                          </div>
                          <span
                            className={`inline-flex items-center w-fit px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(plan.status)}`}
                          >
                            {plan.status?.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Calendar size={14} className="text-slate-400" />
                          <span>
                            {plan.planned_end_date
                              ? new Date(
                                  plan.planned_end_date,
                                ).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="w-48">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {plan.progress_percentage || 0}% Complete
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400">
                              {plan.completed_stages || 0}/
                              {plan.total_stages || 0} OPS
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-1.5">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${plan.progress_percentage || 0}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Clock size={10} />
                            <span>No work orders</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1">
                          {[
                            {
                              icon: Eye,
                              onClick: () =>
                                navigate(
                                  `/department/production/plans/${plan.plan_name || plan.id}`,
                                  { state: { viewMode: true } },
                                ),
                            },
                            { icon: BarChart2 },
                            { 
                              icon: Settings,
                              tooltip: "Create Work Orders",
                              onClick: () => handleGenerateWorkOrders(plan.id)
                            },
                            { 
                              icon: Send,
                              tooltip: "Send Material Request",
                              onClick: () => handleSendMaterialRequest(plan.id)
                            },
                            {
                              icon: Edit2,
                              onClick: () =>
                                navigate(
                                  `/department/production/plans/${plan.id}`,
                                  { state: { viewMode: false } },
                                ),
                            },
                            { 
                              icon: Bell, 
                              badge: plan.material_request_count > 0,
                              count: plan.material_request_count,
                              onClick: () => handleViewTraceability(plan.id, plan.plan_name)
                            },
                            {
                              icon: Trash2,
                              variant: "danger",
                              onClick: () => handleDeletePlan(plan.id),
                            },
                          ].map((action, idx) => (
                            <button
                              key={idx}
                              onClick={action.onClick}
                              title={action.tooltip}
                              className={`p-2 rounded-lg transition-all relative ${
                                action.variant === "danger"
                                  ? "text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  : "text-slate-300 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                            >
                              <action.icon size={16} />
                              {action.badge && (
                                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-blue-500 text-[8px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                                  {action.count || 1}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Production Intelligence System v2.0
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Neural Link Active
              </span>
            </div>
          </div>
        </div>
      </div>
      {showTraceabilityModal && (
        <MaterialRequestTraceabilityModal
          isOpen={showTraceabilityModal}
          onClose={() => setShowTraceabilityModal(false)}
          planId={selectedPlanId}
          planName={selectedPlanName}
        />
      )}
      {showMaterialRequestModal && (
        <MaterialRequestModal
          isOpen={showMaterialRequestModal}
          onClose={() => setShowMaterialRequestModal(false)}
          data={selectedPlanData}
          materials={selectedPlanMaterials}
          planId={selectedPlanData?.planId}
        />
      )}
    </div>
  );
};

export default ProductionPlansPage;
