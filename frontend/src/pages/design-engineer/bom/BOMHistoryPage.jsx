import React, { useState, useEffect, useCallback } from "react";
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

  const fetchBOMHistory = useCallback(async (group) => {
    try {
      setLoading(true);
      const versions = group.revisions.map(bom => ({
        id: bom.id,
        version: `Rev ${bom.revision}`,
        date: new Date(bom.createdAt).toLocaleDateString(),
        author: bom.createdByName || "System",
        status: bom.status,
        itemCode: bom.itemCode,
        revision: bom.revision,
        totalCost: bom.totalCost,
        itemGroup: bom.itemGroup,
        description: bom.description
      }));

      setSelectedBOMData({
        itemCode: group.itemCode,
        productName: group.name,
        versions: versions
      });
      setError("");
    } catch (err) {
      console.error("Failed to fetch BOM details:", err);
      setError("Failed to load BOM history");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBOMs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/engineering/bom/comprehensive");
      const allBoms = response.data.boms || [];
      
      // Group by itemCode
      const grouped = {};
      allBoms.forEach(bom => {
        const key = bom.itemCode || "unknown";
        if (!grouped[key]) {
          grouped[key] = {
            itemCode: key,
            productName: bom.productName,
            revisions: []
          };
        }
        grouped[key].revisions.push(bom);
      });

      const formattedBoms = Object.values(grouped).map(group => ({
        id: group.itemCode,
        name: group.productName,
        itemCode: group.itemCode,
        revisions: group.revisions.sort((a, b) => b.revision - a.revision)
      }));

      setBoms(formattedBoms);
      if (formattedBoms.length > 0) {
        setSelectedBOM(formattedBoms[0].itemCode);
        fetchBOMHistory(formattedBoms[0]);
      }
    } catch (err) {
      console.error("Failed to fetch BOMs:", err);
      setError("Failed to load BOMs");
    } finally {
      setLoading(false);
    }
  }, [fetchBOMHistory]);

  useEffect(() => {
    fetchBOMs();
  }, [fetchBOMs]);

  const handleSelectBOM = (group) => {
    setSelectedBOM(group.itemCode);
    fetchBOMHistory(group);
  };

  const handleDownloadBOM = async (version) => {
    try {
      const response = await axios.get(`/engineering/bom/comprehensive/${version.id}`);
      const bomData = response.data;
      
      const csvContent = [
        ['Type', 'Item Code / Name', 'Group', 'Quantity', 'Unit', 'Rate'],
        ...(bomData.components || []).map(item => [
          'Sub Assembly / Component',
          item.componentCode,
          'Sub Assemblies',
          item.quantity,
          item.uom,
          item.rate
        ]),
        ...(bomData.materials || []).map(item => [
          'Material',
          item.itemName,
          item.itemGroup || '',
          item.quantity,
          item.uom,
          item.rate
        ]),
        ...(bomData.operations || []).map(item => [
          'Operation',
          item.operationName,
          item.workstation || '',
          item.cycleTime,
          'min',
          item.cost
        ])
      ];

      const csvString = csvContent
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BOM_${bomData.itemCode}_Rev${bomData.revision}.csv`;
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
    Swal.fire({
      icon: 'info',
      title: 'BOM Details',
      html: `<div class="text-left space-y-2">
        <p><strong>Revision:</strong> ${version.version}</p>
        <p><strong>Date:</strong> ${version.date}</p>
        <p><strong>Author:</strong> ${version.author}</p>
        <p><strong>Status:</strong> <span class="capitalize">${version.status}</span></p>
        <p><strong>Item Group:</strong> ${version.itemGroup || 'N/A'}</p>
        <p><strong>Total Cost:</strong> ₹${parseFloat(version.totalCost || 0).toLocaleString()}</p>
        ${version.description ? `<p><strong>Description:</strong> ${version.description}</p>` : ''}
      </div>`,
      confirmButtonColor: '#3b82f6'
    });
  };

  const handleRestoreBOM = async (version) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Revert to Draft?',
      text: `Are you sure you want to revert ${version.version} to draft status?`,
      confirmButtonText: 'Revert',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      showCancelButton: true
    });

    if (result.isConfirmed) {
      setRestoring(true);
      try {
        await axios.patch(`/engineering/bom/comprehensive/${version.id}/status`, {
          status: 'draft'
        });
        await fetchBOMs();
        
        Swal.fire({
          icon: 'success',
          title: 'Reverted',
          text: `BOM reverted to draft status`,
          confirmButtonColor: '#3b82f6',
          timer: 2000
        });
      } catch (err) {
        console.error('Restore error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Revert Failed',
          text: 'Could not update BOM status',
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          BOM History
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
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
              {boms.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleSelectBOM(group)}
                  className={`w-full text-left p-2 rounded-lg transition-colors text-xs ${
                    selectedBOM === group.itemCode
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="font-semibold">{group.name}</div>
                  <div className="text-xs opacity-75">{group.itemCode}</div>
                  <div className="text-[10px] mt-1 text-slate-500">{group.revisions.length} Revisions</div>
                </button>
              ))}
            </div>
          </div>

          {/* Version History */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
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
                      {version.description}
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
