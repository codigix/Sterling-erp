import React, { useState, useEffect } from "react";
import { Search, Eye, Download, Trash2, AlertCircle } from "lucide-react";
import axios from "../../../utils/api";
import Swal from "sweetalert2";

const ViewBOMsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [bomDetails, setBomDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/production/bom/all");
      
      const formattedBoms = await Promise.all(
        (response.data || []).map(async (bom) => {
          try {
            const detailResponse = await axios.get(`/production/bom/${bom.id}`);
            const itemCount = detailResponse.data.lineItems?.length || 0;
            return {
              id: bom.id,
              name: bom.bom_number,
              project: bom.sales_order_id || "Standalone BOM",
              items: itemCount,
              created: new Date(bom.created_at).toLocaleDateString(),
              status: bom.status === 'draft' ? 'Draft' : 'Final',
            };
          } catch (err) {
            console.error(`Failed to fetch details for BOM ${bom.id}:`, err);
            return {
              id: bom.id,
              name: bom.bom_number,
              project: bom.sales_order_id || "Standalone BOM",
              items: 0,
              created: new Date(bom.created_at).toLocaleDateString(),
              status: bom.status === 'draft' ? 'Draft' : 'Final',
            };
          }
        })
      );
      
      setBoms(formattedBoms);
    } catch (err) {
      console.error("Failed to fetch BOMs:", err);
      setError("Failed to load BOMs");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (bomId) => {
    try {
      setDetailsLoading(true);
      const response = await axios.get(`/production/bom/${bomId}`);
      setBomDetails(response.data);
      setSelectedBOM(bomId);
      
      const itemCount = response.data.lineItems?.length || 0;
      setBoms(prevBoms => 
        prevBoms.map(bom => 
          bom.id === bomId ? { ...bom, items: itemCount } : bom
        )
      );
    } catch (err) {
      console.error("Failed to fetch BOM details:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: "Could not fetch BOM details. Please try again.",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExport = async (bom) => {
    try {
      const response = await axios.get(`/production/bom/${bom.id}`);
      const bomData = response.data;
      
      let csvContent = "BOM Details\n\n";
      csvContent += `BOM Name,${bomData.bom.bom_number}\n`;
      csvContent += `Status,${bomData.bom.status}\n`;
      csvContent += `Created,${new Date(bomData.bom.created_at).toLocaleDateString()}\n`;
      csvContent += `Created By,${bomData.bom.created_by_name || 'N/A'}\n\n`;
      
      csvContent += "Line Items\n";
      csvContent += "Item Code,Description,Quantity,Unit,Unit Cost,Specification,Part Type\n";
      
      bomData.lineItems.forEach(item => {
        csvContent += `${item.item_code},${item.item_description},${item.quantity},${item.unit},${item.unit_cost},${item.specification || ''},${item.part_type}\n`;
      });
      
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BOM_${bomData.bom.bom_number}_${new Date().getTime()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      Swal.fire({
        icon: "success",
        title: "Exported Successfully",
        text: `BOM '${bomData.bom.bom_number}' exported as CSV`,
        confirmButtonColor: "#10b981",
        timer: 2000,
      });
    } catch (err) {
      console.error("Failed to export BOM:", err);
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Could not export BOM. Please try again.",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleDelete = async (bomId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete BOM",
      text: "Are you sure you want to delete this BOM? This action cannot be undone.",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/production/bom/${bomId}`);
      setBoms(boms.filter(b => b.id !== bomId));
      if (selectedBOM === bomId) {
        setSelectedBOM(null);
        setBomDetails(null);
      }

      Swal.fire({
        icon: "success",
        title: "Deleted Successfully",
        text: "BOM has been deleted.",
        confirmButtonColor: "#10b981",
        timer: 2000,
      });
    } catch (err) {
      console.error("Failed to delete BOM:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Could not delete BOM. Please try again.",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const filteredBOMs = boms.filter(
    (bom) =>
      (bom.name && bom.name.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bom.project && bom.project.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
          View BOMs
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
          Browse and manage existing bills of materials
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search BOMs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">Loading BOMs...</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBOMs.map((bom) => (
              <div
                key={bom.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {bom.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 text-xs">
                      {bom.project}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      bom.status === "Final"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {bom.status}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded p-3 mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {bom.items}
                    </span>{" "}
                    items
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Created: {bom.created}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleView(bom.id)} className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center text-xs justify-center gap-2">
                    <Eye size={16} />
                    View
                  </button>
                  <button onClick={() => handleExport(bom)} className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded text-sm hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center text-xs justify-center gap-2">
                    <Download size={16} />
                    Export
                  </button>
                  <button onClick={() => handleDelete(bom.id)} className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-red-600 dark:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredBOMs.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
              <p className="text-slate-500 dark:text-slate-400">No BOMs found</p>
            </div>
          )}
        </div>
      )}

      {selectedBOM && bomDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                BOM Details: {bomDetails.bom.bom_number}
              </h3>
              <button
                onClick={() => {
                  setSelectedBOM(null);
                  setBomDetails(null);
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Status</p>
                  <p className="font-semibold text-slate-900 dark:text-white capitalize">
                    {bomDetails.bom.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Created By</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {bomDetails.bom.created_by_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Created</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {new Date(bomDetails.bom.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Items</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {bomDetails.lineItems.length}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Line Items
                </h4>
                <div className="space-y-2">
                  {bomDetails.lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {item.item_code}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {item.item_description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {item.quantity} {item.unit}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            @ ${item.unit_cost}
                          </p>
                        </div>
                      </div>
                      {item.specification && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Spec: {item.specification}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        Type: {item.part_type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBOMsPage;
