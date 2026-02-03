import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Download, Award, Loader2 } from "lucide-react";
import axios from "../../../utils/api";

const ApprovedReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const rootCardId = searchParams.get("rootCardId");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApprovedReviews();
    
    // Auto-complete the "Document Approved Designs" task if taskId is present
    if (taskId) {
      completeTask();
    }
  }, [taskId]);

  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/production/designs");
      const designs = Array.isArray(response.data) ? response.data : response.data?.designs || [];
      
      // Filter for completed designs
      let approvedDesigns = designs.filter(d => 
        d.status === "Completed" || d.status === "completed"
      );

      // Filter by rootCardId if present
      if (rootCardId) {
        approvedDesigns = approvedDesigns.filter(d => String(d.rootCardId) === String(rootCardId));
      }

      approvedDesigns = approvedDesigns.map(d => ({
        id: d.id,
        design: d.title || "Untitled Design",
        approvedBy: "Lead Engineer",
        approvedDate: d.updatedAt ? new Date(d.updatedAt).toISOString().split('T')[0] : "N/A",
        signature: "L.Engineer",
        projectName: d.projectName,
        customerName: d.customerName
      }));
      
      setReviews(approvedDesigns);
    } catch (err) {
      console.error("Failed to fetch approved reviews:", err);
      setError("Failed to load approved reviews");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async () => {
    try {
      await axios.patch(`/department/portal/tasks/${taskId}`, {
        status: "completed",
      });
      console.log(`Task ${taskId} marked as completed`);
    } catch (err) {
      console.error("Error marking task as completed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
          Approved Reviews
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
          Approved and finalized designs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center text-xs gap-2 mb-2">
                    <CheckCircle
                      size={24}
                      className="text-green-600 dark:text-green-400"
                    />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {review.design}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Project: {review.projectName} | Client: {review.customerName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Approved by:{" "}
                    <span className="font-medium text-slate-900 dark:text-white">{review.approvedBy}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Approved Date
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {review.approvedDate}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 mb-4 flex items-center text-xs gap-2">
                <Award size={18} className="text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Officially approved and ready for production
                </span>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center text-xs justify-center gap-2">
                  <Award size={18} />
                  View Approval
                </button>
                <button className="flex-1 px-4 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center text-xs justify-center gap-2">
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Award size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No approved designs yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedReviewsPage;
