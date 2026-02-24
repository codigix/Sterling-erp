import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Search, 
  Eye, 
  Download, 
  Trash2, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Layers, 
  PackageCheck, 
  FileText, 
  Send, 
  TrendingUp,
  Filter,
  MoreVertical,
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../../utils/api";
import Swal from "sweetalert2";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable/DataTable";
import Card, { CardContent } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import SearchableSelect from "../../../components/ui/SearchableSelect";

const ViewBOMsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rootCardIdFromUrl = searchParams.get("rootCardId");
  const taskIdFromUrl = searchParams.get("taskId");
  const taskTitleFromUrl = searchParams.get("taskTitle") || "";
  const isSendToAdminTask = taskTitleFromUrl.toLowerCase().includes("send bom");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rootCardFilter, setRootCardFilter] = useState("all");
  const [boms, setBoms] = useState([]);
  const [rootCards, setRootCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (rootCardIdFromUrl) {
      setRootCardFilter(rootCardIdFromUrl);
    }
  }, [rootCardIdFromUrl]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bomRes, rcRes] = await Promise.all([
        axios.get("/engineering/bom/comprehensive"),
        axios.get("/root-cards", {
          params: { assignedOnly: true }
        })
      ]);
      setBoms(bomRes.data.boms || []);
      setRootCards(rcRes.data.rootCards || rcRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load BOMs or Root Cards");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bomId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete BOM",
      text: "Are you sure you want to delete this comprehensive BOM? This action cannot be undone.",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/engineering/bom/comprehensive/${bomId}`);
      setBoms(boms.filter(b => b.id !== bomId));
      Swal.fire({
        icon: "success",
        title: "Deleted Successfully",
        text: "BOM has been deleted.",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Failed to delete BOM:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Could not delete BOM. Please try again.",
      });
    }
  };
  
  const handleSendToAdmin = async (bomId) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Send BOM to Admin",
      text: "This will set the BOM status to 'active' and notify the admin. Are you sure?",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      confirmButtonText: "Yes, Send",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.patch(`/engineering/bom/comprehensive/${bomId}/status`, {
        status: "active"
      });
      
      // Update local state
      setBoms(boms.map(b => b.id === bomId ? { ...b, status: 'active' } : b));
      
      // If we have a taskId from the URL, try to complete it
      if (taskIdFromUrl) {
        try {
          await axios.patch(`/department/portal/tasks/${taskIdFromUrl}`, {
            status: "completed"
          });
        } catch (taskErr) {
          console.error("Failed to complete task:", taskErr);
        }
      }

      Swal.fire({
        icon: "success",
        title: "Sent Successfully",
        text: "BOM has been sent to admin.",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Failed to send BOM:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: "Could not send BOM to admin. Please try again.",
      });
    }
  };

  const filteredBOMs = useMemo(() => {
    return boms.filter((bom) => {
      // If it's the "Send to Admin" task, show all BOMs for this specific root card
      if (isSendToAdminTask) {
        return String(bom.rootCardId) === String(rootCardIdFromUrl);
      }

      const matchesSearch = 
        (bom.productName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bom.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bom.bomNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || bom.status === statusFilter;
      const matchesType = typeFilter === "all" || bom.itemGroup === typeFilter;
      const matchesRootCard = rootCardFilter === "all" || String(bom.rootCardId) === String(rootCardFilter);
      
      return matchesSearch && matchesStatus && matchesType && matchesRootCard;
    });
  }, [boms, searchTerm, statusFilter, typeFilter, rootCardFilter, isSendToAdminTask]);

  const rootCardOptions = useMemo(() => {
    const options = (Array.isArray(rootCards) ? rootCards : []).map(rc => ({
      label: `${rc.po_number || rc.code || 'N/A'} - ${rc.project_name || rc.customer || rc.title || 'N/A'}`,
      value: String(rc.id)
    }));
    return [{ label: "All Root Cards", value: "all" }, ...options];
  }, [rootCards]);

  const stats = useMemo(() => {
    const total = boms.length;
    const active = boms.filter(b => b.status === 'active').length;
    const draft = boms.filter(b => b.status === 'draft').length;
    const totalCost = boms.reduce((acc, bom) => acc + (parseFloat(bom.totalCost) || 0), 0);

    return [
      { label: "Total BOMs", value: total, icon: FileText, color: "blue" },
      { label: "Active BOMs", value: active, icon: Send, color: "green" },
      { label: "Draft BOMs", value: draft, icon: AlertCircle, color: "amber" },
      { label: "Total Cost", value: `₹${totalCost.toLocaleString()}`, icon: TrendingUp, color: "purple" },
    ];
  }, [boms]);

  const rootCardMap = useMemo(() => {
    const map = {};
    (Array.isArray(rootCards) ? rootCards : []).forEach(rc => {
      map[rc.id] = rc;
    });
    return map;
  }, [rootCards]);

  const columns = [
    {
      key: "productName",
      label: "ITEM",
      render: (val, row) => {
        const linkedRC = rootCardMap[row.rootCardId];
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 dark:text-white">{val}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                {row.bomNumber || row.itemCode}
              </span>
              {linkedRC && (
                <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                  <ClipboardList size={10} />
                  {linkedRC.po_number || linkedRC.code}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: "itemGroup",
      label: "TYPE",
      render: (val) => {
        const isFinished = val === "Finished Goods" || val === "Finished Good";
        const isSubAssembly = val === "Sub Assemblies" || val === "Sub-assembly";
        
        if (isFinished) {
          return (
            <Badge variant="secondary" className="gap-1.5 py-1 px-2.5">
              <PackageCheck size={12} />
              Finished Good
            </Badge>
          );
        }
        if (isSubAssembly) {
          return (
            <Badge variant="primary" className="gap-1.5 py-1 px-2.5 bg-purple-50 text-purple-700 border-purple-100">
              <Layers size={12} />
              Sub-Assembly
            </Badge>
          );
        }
        return <Badge variant="gray">{val || "Other"}</Badge>;
      }
    },
    {
      key: "isActive",
      label: "IS ACTIVE",
      render: (val, row) => (
        <input 
          type="checkbox" 
          checked={row.status === 'active'} 
          readOnly 
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
        />
      )
    },
    {
      key: "isDefault",
      label: "IS DEFAULT",
      render: (val) => (
        <input 
          type="checkbox" 
          checked={val === true || val === 1} 
          readOnly 
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
        />
      )
    },
    {
      key: "quantity",
      label: "BOM QTY",
      render: (val, row) => (
        <span className="font-medium text-slate-700">
          {(parseFloat(val) || 0).toFixed(2)} {row.uom || 'Nos'}
        </span>
      )
    },
    {
      key: "totalCost",
      label: "TOTAL COST",
      render: (val) => (
        <span className="font-bold text-slate-900">
          ₹{(parseFloat(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: "updatedAt",
      label: "LAST UPDATED ON",
      render: (val) => new Date(val).toLocaleDateString('en-GB')
    },
    {
      key: "status",
      label: "STATUS",
      render: (val) => (
        <Badge 
          variant={val === 'active' ? 'success' : val === 'approved' ? 'primary' : 'warning'}
          className="capitalize"
        >
          {val}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "ACTIONS",
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(`/design-engineer/bom/view/${row.id}`)}
            className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600 transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => navigate(`/design-engineer/bom/create?bomId=${row.id}`)}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
            title="Edit BOM"
          >
            <Edit2 size={16} />
          </button>
          {row.status === 'approved' && (row.itemGroup === "Finished Goods" || row.itemGroup === "Finished Good") && (
            <button 
              onClick={() => handleSendToAdmin(row.id)}
              className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600 transition-colors"
              title="Send to Admin"
            >
              <Send size={16} />
            </button>
          )}
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-1.5 hover:bg-red-50 rounded-md text-red-600 transition-colors"
            title="Delete BOM"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isSendToAdminTask ? "Send Finished Good BOM to Admin" : "Bill of Materials"}
          </h2>
          <p className="text-slate-500 text-xs">
            {isSendToAdminTask 
              ? "Select an approved Finished Good BOM to send to the admin for final processing"
              : "Manage your product structures and assembly definitions"}
          </p>
        </div>
        {!isSendToAdminTask && (
          <Button 
            variant="primary" 
            icon={Plus} 
            onClick={() => navigate("/design-engineer/bom/create")}
          >
            Create New BOM
          </Button>
        )}
      </div>

      {isSendToAdminTask && filteredBOMs.length === 0 && !loading && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="text-amber-600" size={20} />
            <p className="text-amber-800 text-sm">
              No **Approved Finished Good BOMs** found for this project. Please ensure the Finished Good BOM is created and approved before sending it to the admin.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {!isSendToAdminTask && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-none shadow-sm overflow-hidden relative">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
              <div className={`absolute top-0 left-0 w-1 h-full bg-${stat.color}-500`} />
            </Card>
          ))}
        </div>
      )}

      {/* Filters & Search */}
      {!isSendToAdminTask && (
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[250px]">
              <Input
                placeholder="Search BOM or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={18} />}
                className="mb-0"
                containerClassName="mt-0"
              />
            </div>
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <SearchableSelect
                    label="Filter by Root Card"
                    options={rootCardOptions}
                    value={rootCardFilter}
                    onChange={(val) => setRootCardFilter(val)}
                    placeholder="Select Root Card..."
                    containerClassName="mt-0"
                    icon={<ClipboardList size={16} />}
                  />
                </div>
                {rootCardFilter !== "all" && (
                  <Button 
                    variant="ghost" 
                    className="mb-0.5 text-xs h-9 px-2 text-slate-500 hover:text-red-600"
                    onClick={() => setRootCardFilter("all")}
                  >
                    CLEAR
                  </Button>
                )}
              </div>
            </div>
            <div className="w-40">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                containerClassName="mt-0"
                className="mt-0"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="approved">Approved</option>
              </Select>
            </div>
            <div className="w-40">
              <Select
                label="Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                containerClassName="mt-0"
                className="mt-0"
              >
                <option value="all">All Types</option>
                <option value="Finished Goods">Finished Goods</option>
                <option value="Sub Assemblies">Sub Assemblies</option>
                <option value="Bought-Out">Bought-Out</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Consumable">Consumable</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <DataTable 
            columns={columns}
            data={filteredBOMs}
            loading={loading}
            emptyMessage={isSendToAdminTask ? "No Approved Finished Good BOMs available to send." : "No Bill of Materials found."}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ViewBOMsPage;
