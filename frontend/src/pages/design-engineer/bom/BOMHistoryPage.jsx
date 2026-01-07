import React, { useState, useEffect } from "react";
import { History, Download, RotateCcw, AlertCircle } from "lucide-react";
import axios from "../../../utils/api";
import Swal from "sweetalert2";

const BOMHistoryPage = () => {
  const [boms, setBoms] = useState([]);
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [selectedBOMData, setSelectedBOMData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [comparing, setComparing] = useState(null);

  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/production/bom/all");
      const formattedBoms = (response.data || []).map(bom => ({
        id: bom.id,
        name: bom.bom_number,
        created_at: bom.created_at,
        status: bom.status,
        created_by_name: bom.created_by_name || "System"
      }));
      setBoms(formattedBoms);
      if (formattedBoms.length > 0) {
        setSelectedBOM(formattedBoms[0].id);
        fetchBOMDetails(formattedBoms[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch BOMs:", err);
      setError("Failed to load BOMs");
      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: "Could not fetch BOMs. Please try again.",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBOMDetails = async (bomId) => {
    try {
      const response = await axios.get(`/production/bom/${bomId}`);
      const bomData = response.data;
      
      const versionNumber = bomData.bom.status === 'approved' ? '1.0' : 
                           bomData.bom.status === 'pending_approval' ? '0.9' : '0.1';
      
      const bomVersions = [
        {
          id: bomData.bom.id,
          version: `v${versionNumber}`,
          date: new Date(bomData.bom.created_at).toLocaleDateString(),
          author: bomData.bom.created_by_name || "System",
          changes: `${bomData.lineItems?.length || 0} items configured - Status: ${bomData.bom.status.replace(/_/g, ' ')}`,
          status: bomData.bom.status,
          lineItemCount: bomData.lineItems?.length || 0
        }
      ];

      setSelectedBOMData({
        bom: bomData.bom,
        lineItems: bomData.lineItems || [],
        versions: bomVersions
      });
      setError("");
    } catch (err) {
      console.error("Failed to fetch BOM details:", err);
      setError("Failed to load BOM details");
      Swal.fire({
        icon: "error",
        title: "Failed to Load Details",
        text: "Could not fetch BOM details. Please try again.",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleSelectBOM = (bomId) => {
    setSelectedBOM(bomId);
    fetchBOMDetails(bomId);
  };

  const handleDownloadBOM = async (version) => {
    try {
      const response = await axios.get(`/production/bom/${version.id}`, {
        responseType: 'json'
      });
      
      const bomData = response.data;
      const csvContent = [
        ['Item Code', 'Description', 'Quantity', 'Unit', 'Unit Cost', 'Specification', 'Part Type'],
        ...bomData.lineItems.map(item => [
          item.item_code,
          item.item_description,
          item.quantity,
          item.unit || 'N/A',
          item.unit_cost || 'N/A',
          item.specification || 'N/A',
          item.part_type || 'N/A'
        ])
      ];

      const csvString = csvContent
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bomData.bom.bom_number}_${version.version}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Downloaded',
        text: 'BOM downloaded successfully',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
    } catch (err) {
      console.error('Download error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Could not download BOM',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleCompareBOM = (version) => {
    setComparing(version);
    Swal.fire({
      icon: 'info',
      title: 'Comparison',
      html: `<div class="text-left">
        <p><strong>Version:</strong> ${version.version}</p>
        <p><strong>Date:</strong> ${version.date}</p>
        <p><strong>Author:</strong> ${version.author}</p>
        <p><strong>Status:</strong> ${version.status}</p>
        <p><strong>Items:</strong> ${version.lineItemCount}</p>
      </div>`,
      confirmButtonColor: '#3b82f6'
    });
  };

  const handleRestoreBOM = async (version) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Restore Version?',
      text: `Are you sure you want to restore ${version.version}? Current changes will be replaced.`,
      confirmButtonText: 'Restore',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      showCancelButton: true
    });

    if (result.isConfirmed) {
      setRestoring(true);
      try {
        await axios.patch(`/production/bom/${selectedBOM}/status`, {
          status: 'draft'
        });
        await fetchBOMDetails(selectedBOM);
        
        Swal.fire({
          icon: 'success',
          title: 'Restored',
          text: `BOM restored to ${version.version}`,
          confirmButtonColor: '#3b82f6',
          timer: 2000
        });
      } catch (err) {
        console.error('Restore error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Restore Failed',
          text: 'Could not restore BOM version',
          confirmButtonColor: '#3b82f6'
        });
      } finally {
        setRestoring(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
          BOM History
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
          View version history and rollback changes
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

      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">Loading BOMs...</p>
        </div>
      ) : boms.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">No BOMs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* BOM List */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              BOMs
            </h3>
            <div className="space-y-2">
              {boms.map((bom) => (
                <button
                  key={bom.id}
                  onClick={() => handleSelectBOM(bom.id)}
                  className={`w-full text-left p-2 rounded-lg transition-colors text-xs ${
                    selectedBOM === bom.id
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="font-semibold">{bom.name}</div>
                  <div className="text-xs opacity-75">{new Date(bom.created_at).toLocaleDateString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Version History */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
              <History size={20} />
              Version History
            </h3>
            {selectedBOMData && selectedBOMData.versions ? (
              <div className="space-y-4">
                {selectedBOMData.versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-700 p-4 rounded"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {version.version}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {version.date} by {version.author}
                        </p>
                      </div>
                      {index > 0 && (
                        <button 
                          onClick={() => handleRestoreBOM(version)}
                          disabled={restoring}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RotateCcw size={14} />
                          {restoring ? 'Restoring...' : 'Restore'}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {version.changes}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => handleDownloadBOM(version)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
                      >
                        <Download size={14} />
                        Download
                      </button>
                      <button 
                        onClick={() => handleCompareBOM(version)}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:underline transition-colors"
                      >
                        Compare
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Select a BOM to view its history</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMHistoryPage;
